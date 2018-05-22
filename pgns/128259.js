module.exports = [
  {
    source: 'Speed Water Referenced',
    node: 'navigation.speedThroughWater',
    filter: function (n2k) {
      return typeof n2k.fields['Speed Water Referenced'] !== 'undefined'
    }
  },
  {
    source: 'Speed Ground Referenced',
    node: 'navigation.speedOverGround',
    filter: function (n2k) {
      return n2k.fields['Speed Ground Referenced']
    }
  },
  {
    source: 'Speed Water Referenced Type',
    node: 'navigation.speedThroughWaterReferenceType',
    filter: function (n2k) {
      return n2k.fields['Speed Water Referenced Type']
    }
  }
]
