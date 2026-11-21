import { PGN_128259 } from '@canboat/ts-pgns'
import { isNumber } from '../utils.js'

module.exports = [
  {
    source: 'speedWaterReferenced',
    node: 'navigation.speedThroughWater',
    filter: function (n2k: PGN_128259) {
      return isNumber(n2k.fields.speedWaterReferenced)
    }
  },
  {
    source: 'speedGroundReferenced',
    node: 'navigation.speedOverGround',
    filter: function (n2k: PGN_128259) {
      return isNumber(n2k.fields.speedGroundReferenced)
    }
  },
  {
    // Signal K's enum values are lowercase, such as 'paddle wheel'
    node: 'navigation.speedThroughWaterReferenceType',
    value: (n2k: PGN_128259) =>
      String(n2k.fields.speedWaterReferencedType).toLowerCase(),
    filter: function (n2k: PGN_128259) {
      return typeof n2k.fields.speedWaterReferencedType === 'string'
    }
  }
]
