import { PGN_130313 } from '@canboat/ts-pgns'

const { instancePrefix } = require('../instanceGroups')

module.exports = [
  {
    node: instancePrefix,
    instance: (n2k: PGN_130313) => n2k.fields.instance + '',
    // canboatjs gives the humidity as a ratio.
    source: 'actualHumidity'
  }
]
