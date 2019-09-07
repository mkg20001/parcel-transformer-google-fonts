import path from 'path'
import fs from 'fs'
import {Transformer} from '@parcel/plugin'
const logic = require('./logic')

export default new Transformer({
  async getConfig ({asset}) {
    /* const config =
      (await asset.getConfig(['.pugrc', '.pugrc.js', 'pug.config.js'])) || {}
    return config */
  },

  async transform ({asset, config, options}) {
    /* if (!config) {
      return [asset]
    } */

    // const pug = await options.packageManager.require('pug', asset.filePath);

    const {assets, processedHtml} = await logic(
      String(fs.readFileSync(asset.filePath)), // contents (todo: use preloaded file?)
      path.dirname(asset.filePath), // assetDir
      this.cachePath,
      {} // globalAssetsStore (todo: better share mechanism)
    )
    this.asset.contents = processedHtml

    /* const html = pug.compileFile(asset.filePath, {
      degug: true,
      compileDebug: false,
      filename: path.basename(asset.filePath),
      pretty: config.pretty || false,
      doctype: config.doctype,
      filters: config.filters,
      filterOptions: config.filterOptions,
      filterAliases: config.filterAliases
    })(config.locals); */

    asset.type = 'html'
    asset.setCode(processedHtml)

    return [asset]
  }
})
/*
const { Middleware } = require('parcel-bundler')
const logic = require('./logic')
const mkdirp = require('mkdirp').sync

class HtmlMiddleware extends Middleware {
  constructor (asset) {
    super(asset)
    this.globalAssetsStore = {}
    this.cachePath = asset.options.cacheDir
    this.assetDir = path.dirname(asset.name)
    mkdirp(this.cachePath)
  }

  async preTransform () {
    const {assets, processedHtml} = await logic(this.asset.contents, this.assetDir, this.cachePath, this.globalAssetsStore)
    this.asset.contents = processedHtml
  }
}

module.exports = HtmlMiddleware
 */
