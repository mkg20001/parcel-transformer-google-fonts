'use strict'

const path = require('path')
const {Transformer} = require('@parcel/plugin')
const logic = require('./logic')

module.exports = new Transformer({
  async transform ({asset, config, options}) {
    const {processedHtml} = await logic(
      await asset.getCode(), // contents
      path.dirname(asset.filePath), // assetDir
      options.cacheDir, // cacheDir
      {} // globalAssetsStore (todo: better share mechanism)
    )

    asset.setCode(processedHtml)

    return [asset]
  }
})
