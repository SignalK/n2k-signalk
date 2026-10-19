import { PGN_130316 } from '@canboat/ts-pgns'
import { instancePrefix } from '../instanceGroups.js'

module.exports = [
  {
    node: instancePrefix,
    instance: (n2k: PGN_130316) => n2k.fields.instance + '',
    source: 'temperature'
  }
]
