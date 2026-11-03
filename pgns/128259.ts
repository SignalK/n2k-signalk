import { PGN_128259 } from '@canboat/ts-pgns'

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
      return n2k.fields.speedGroundReferenced
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
