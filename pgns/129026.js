
module.exports = [
  {
    source: 'SOG',
    node: 'navigation.speedOverGround'
  }, {
    source: 'COG',
    node: 'navigation.courseOverGroundTrue',
    filter: function(n2k) {
      return n2k.fields['COG Reference'] === 'True';
    }
  }, {
    source: 'COG',
    node: 'navigation.courseOverGroundMagnetic',
    filter: function(n2k) {
      return n2k.fields['COG Reference'] === 'Magnetic';
    }
  }
]
