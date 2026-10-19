import { PGN_130312 } from '@canboat/ts-pgns'
import { instancePrefix } from '../instanceGroups.js'

module.exports = [
  {
    node: instancePrefix,
    instance: (n2k: PGN_130312) =>
      n2k.fields.instance != null ? n2k.fields.instance + '' : null,
    source: 'actualTemperature'
  }
]
