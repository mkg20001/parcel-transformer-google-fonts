'use strict'

const crypto = require('crypto')
const https = require('https')
const shortHash = str => {
  const hash = crypto.createHash('sha256').update(str).digest('hex')
  const offset = parseInt(hash[6], 16)
  return hash.substr(offset, 16)
}
const prom = fnc => new Promise((resolve, reject) => fnc((err, res) => err ? reject(err) : resolve(res)))

const regex = /(https?:)?(\/\/)?(fonts\.googleapis\.com\/(css|css2|icon)\?family=([A-Za-z0-9+:,&;=@]+))/gmi
const regexFiles = /http[s]*:\/\/(([a-z0-9_./A-Z-]+)\/([a-z0-9_./A-Z-]+))/gmi

const debug = require('debug')
const log = debug('parcel-plugin-google-fonts:util')

function regexIterate (regex, str, iterator) {
  let result
  const out = []

  while ((result = regex.exec(str)) !== null) {
    out.push(iterator(result))
  }

  return out
}

module.exports = {
  regex,
  regexFiles,
  findMatches: string => regexIterate(regex, string, res => {
    return {
      match: res[0],
      url: 'https://' + res[3],
      filename: 'gfonts-' + shortHash(res[5]) + '.css'
    }
  }),
  findFileMatches: string => regexIterate(regexFiles, string, res => {
    return {
      match: res[0],
      url: 'https://' + res[1],
      filename: 'gfonts-' + res[3]
    }
  }),
  downloadFile: async url => {
    let tries = 0
    let lastError

    while (true) {
      if (tries === 3) {
        throw lastError
      }

      try {
        log('https get url %o, try %s/3', url, tries + 1)

        const res = await prom(cb => {
          https.get(url, res => {
            if (res.statusCode !== 200) {
              throw new Error(`Got ${res.statusCode} ${res.statusText} while downloading ${url}`)
            }

            res.once('error', cb)

            const data = []

            res.on('data', _data => (data.push(_data)))
            res.once('close', () => cb(null, Buffer.concat(data)))
          }).once('error', cb)
        })

        return res
      } catch (error) {
        tries++
        log('get %o: %o', url, error)
        lastError = error
      }
    }
  }
}
