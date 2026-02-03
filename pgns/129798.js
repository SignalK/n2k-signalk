const padUserID = require('../mmsi-context').padUserID

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
      var res = {
        longitude: Number(n2k.fields.longitude),
        latitude: Number(n2k.fields.latitude)
      }
      if (typeof n2k.fields.altitude !== 'undefined') {
        res.altitude = Number(n2k.fields.altitude)
      }
      return res
    },
    node: 'navigation.position'
  },
  {
    node: '',
    filter: n2k => n2k.fields.userId,
    value: function (n2k) {
      return {
        mmsi: padUserID(n2k)
      }
    }
  },
  {
    context: function (n2k) {
      return typeof n2k.fields.userId !== 'undefined'
        ? 'sar.urn:mrn:imo:mmsi:' + padUserID(n2k)
        : 'sar.unknown'
    }
  },
  {
    node: 'sensors.ais.class',
    value: function (n2k) {
      return 'SAR'
    }
  }
]
