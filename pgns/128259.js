module.exports = [
  {
    source: 'Speed Water Referenced',
    node: 'navigation.speedThroughWater',
    filter: function (n2k) {
      return n2k.fields['Speed Water Referenced']
    }
  },
  {
    source: 'Speed Ground Referenced',
    node: 'navigation.speedOverGround',
    filter: function (n2k) {
      return n2k.fields['Speed Ground Referenced']
    }
  }
]
