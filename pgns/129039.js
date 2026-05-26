const getMmsiContext = require('../mmsi-context').getMmsiContext

module.exports = [
  {
    source: 'sog',
    node: 'navigation.speedOverGround'
  },
  {
    source: 'cog',
    node: 'navigation.courseOverGroundTrue'
  },
  {
    filter: n2k => n2k.fields.longitude && n2k.fields.latitude,
    value: function (n2k) {
      return {
        longitude: Number(n2k.fields.longitude),
        latitude: Number(n2k.fields.latitude)
      }
    },
    node: 'navigation.position'
  },
  {
    source: 'heading',
    node: 'navigation.headingTrue'
  },
  {
    node: '',
    filter: n2k => n2k.fields.userId,
    value: function (n2k) {
      return {
        mmsi: n2k.fields.userId.toString()
      }
    }
  },
  {
    context: getMmsiContext
  },
  {
    node: 'sensors.ais.class',
    value: function (n2k) {
      return 'B'
    }
  }
]
