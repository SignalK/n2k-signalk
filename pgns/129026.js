module.exports = [
  {
    source: 'sog',
    node: 'navigation.speedOverGround'
  },
  {
    source: 'cog',
    node: 'navigation.courseOverGroundTrue',
    filter: function (n2k) {
      return n2k.fields.cogReference === 'True'
    }
  },
  {
    source: 'cog',
    node: 'navigation.courseOverGroundMagnetic',
    filter: function (n2k) {
      return n2k.fields.cogReference === 'Magnetic'
    }
  }
]
