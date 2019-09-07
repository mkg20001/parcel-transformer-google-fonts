'use strict'

const path = require('path')
const {Transformer} = '@parcel/plugin'
const logic = require('./logic')

module.exports = new Transformer({
  async transform ({asset, config, options}) {
    const {processedHtml} = await logic(
      asset.getCode(), // contents
      path.dirname(asset.filePath), // assetDir
      options.cacheDir, // cacheDir
      {} // globalAssetsStore (todo: better share mechanism)
    )

    asset.type = 'html'
    asset.setCode(processedHtml)

    return [asset]
  }
})
