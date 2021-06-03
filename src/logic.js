'use strict'

const fs = require('fs')
const path = require('path')
const { downloadFile, findMatches, findFileMatches, regex, regexFiles, regexIterate } = require('./util')

async function downloadMatch (match, cachePath, globalAssetsStore, justFetch) {
  let data
  const p = path.join(cachePath, match.filename)

  if (globalAssetsStore[match.filename] || fs.existsSync(p)) {
    if (!justFetch) {
      data = fs.readFileSync(p)
    }
  } else {
    data = await downloadFile(match.url)

    fs.writeFileSync(p, data)
  }

  globalAssetsStore[match.filename] = p

  return { data, path: p }
}

function safeReplace (str, regex, replace) {
  let replaced = 0

  const out = str.replace(regex, match => {
    replaced++
    const replaceWith = replace[match]

    if (!replaceWith) {
      throw new Error(`GFonts Internal Error: Could not remap ${JSON.stringify(match)}`)
    }

    return replaceWith
  })

  if (!replaced) {
    throw new Error('GFonts Internal error: Replace did not successfully replace anything')
  }

  return out
}

function postProcess (origPath, cachePath, globalAssetsStore, doProcess) {
  const outPath = path.join(cachePath, 'processed-' + path.basename(origPath))

  if (!globalAssetsStore[outPath]) {
    const contents = fs.readFileSync(origPath)

    const out = doProcess(contents)

    fs.writeFileSync(outPath, out)
  }

  return { path: outPath }
}

async function googleFontsTree (html, assetDir, cachePath, globalAssetsStore) {
  const matches = findMatches(html)

  const replace = {}

  const _uniq = {}
  const cssFiles = []
  const assets = []

  let i

  const fileMatches = []

  for (i = 0; i < matches.length; i++) {
    const match = matches[i]

    const { data, path } = await downloadMatch(match, cachePath, globalAssetsStore) // download css

    match.path = path
    cssFiles.push(match)

    const asset = {
      type: 'css',
      path,
      subassets: []
    }
    assets.push(asset)

    const _fileMatches = findFileMatches(String(data))

    _fileMatches.forEach(el => {
      asset.subassets.push(match)

      if (!_uniq[el.filename]) {
        fileMatches.push(el)

        _uniq[el.filename] = true
      }
    })
  }

  for (i = 0; i < fileMatches.length; i++) {
    const match = fileMatches[i]
    const { path: p } = await downloadMatch(match, cachePath, globalAssetsStore, true) // download fonts

    replace[match.match] = './' + path.basename(p) // we don't need path.realtive because the css files are stored in the same folder as the fonts
  }

  await Promise.all(cssFiles.map(async match => {
    const { path: p } = await postProcess(match.path, cachePath, globalAssetsStore,
      contents => safeReplace(String(contents), regexFiles, replace))

    match.path = p
    replace[match.match] = './' + path.relative(assetDir, p)
  }))

  assets.forEach(asset => {
    const { subassets } = asset
    asset.subassets = subassets.map(subasset => {
      return {
        type: path.parse(subasset.path).ext.substr(1),
        path: subasset.path
      }
    })
  })

  return {
    processedHtml: matches.length ? safeReplace(html, regex, replace) : html,
    assets,
    inUse: Boolean(matches.length)
  }
}

module.exports = googleFontsTree
