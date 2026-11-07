import { PGN_129025 } from '@canboat/ts-pgns'
import { isPosition } from '../utils.js'

module.exports = [
  {
    value: function (n2k: PGN_129025) {
      return {
        longitude: Number(n2k.fields.longitude),
        latitude: Number(n2k.fields.latitude)
      }
    },
    filter: function (n2k: PGN_129025) {
      return isPosition(n2k.fields.latitude, n2k.fields.longitude)
    },
    node: 'navigation.position'
  }
]
