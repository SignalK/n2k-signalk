import { PGN_130314 } from '@canboat/ts-pgns'
import { instancePrefix } from '../instanceGroups.js'

module.exports = [
  {
    node: instancePrefix,
    instance: (n2k: PGN_130314) => n2k.fields.instance + '',
    source: 'pressure'
  }
]
