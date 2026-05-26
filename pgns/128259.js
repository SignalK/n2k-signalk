module.exports = [
  {
    source: 'speedWaterReferenced',
    node: 'navigation.speedThroughWater',
    filter: function (n2k) {
      return typeof n2k.fields.speedWaterReferenced !== 'undefined'
    }
  },
  {
    source: 'speedGroundReferenced',
    node: 'navigation.speedOverGround',
    filter: function (n2k) {
      return n2k.fields.speedGroundReferenced
    }
  },
  {
    source: 'speedWaterReferencedType',
    node: 'navigation.speedThroughWaterReferenceType',
    filter: function (n2k) {
      return n2k.fields.speedWaterReferencedType
    }
  }
]
