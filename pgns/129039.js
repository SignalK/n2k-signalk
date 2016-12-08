const getMmsiContext = require('../mmsi-context')

module.exports = [
  {
    source: 'SOG',
    node: 'navigation.speedOverGround'
  }, {
    source: 'COG',
    node: 'navigation.courseOverGroundTrue'
  }, {
    value: function(n2k) {
      return {
        longitude: Number(n2k.fields.Longitude),
        latitude: Number(n2k.fields.Latitude)
      }
    },
    node: 'navigation.position'
  }, {
    context: getMmsiContext
  }]
