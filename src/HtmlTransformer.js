import path from 'path'
import {Transformer} from '@parcel/plugin'
const logic = require('./logic')

export default new Transformer({
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
