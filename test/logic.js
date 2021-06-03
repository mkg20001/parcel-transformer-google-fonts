'use strict'

const os = require('os')
const mkdirp = require('mkdirp').sync
const path = require('path')
const fs = require('fs')

const TMPDIR = path.join(os.tmpdir(), 'gfontsparcel-' + String(Math.random()))
mkdirp(TMPDIR)

const cachePath = TMPDIR
const globalAssetsStore = {}
const testPage = String(fs.readFileSync(require.resolve('./testpage.html')))

const logic = require('../src/logic')

describe('logic.js processes html page correctly', () => {
  it('works', async () => {
    const out = await logic(testPage, os.tmpdir(), cachePath, globalAssetsStore)

    console.log('%o', { out, globalAssetsStore })
  })
})
