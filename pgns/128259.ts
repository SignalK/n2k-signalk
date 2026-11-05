import { PGN_128259 } from '@canboat/ts-pgns'
import { isNumber } from '../utils.js'

module.exports = [
  {
    source: 'speedWaterReferenced',
    node: 'navigation.speedThroughWater',
    filter: function (n2k: PGN_128259) {
      return typeof n2k.fields.speedWaterReferenced !== 'undefined'
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
    source: 'speedWaterReferencedType',
    node: 'navigation.speedThroughWaterReferenceType',
    filter: function (n2k: PGN_128259) {
      return n2k.fields.speedWaterReferencedType
    }
  }
]
