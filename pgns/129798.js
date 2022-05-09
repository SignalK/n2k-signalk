const padUserID = require('../mmsi-context').padUserID

module.exports = [
  {
    source: 'SOG',
    node: 'navigation.speedOverGround'
  },
  {
    source: 'COG',
    node: 'navigation.courseOverGroundTrue'
  },
  {
    filter: (n2k) => n2k.fields.Longitude && n2k.fields.Latitude,
    value: function (n2k) {
      var res = {
        longitude: Number(n2k.fields.Longitude),
        latitude: Number(n2k.fields.Latitude)
      }
      if ( typeof n2k.fields.Altitude !== 'undefined' ) {
        res.altitude =  Number(n2k.fields.Altitude)
      }
      return res
    },
    node: 'navigation.position'
  },
  {
    node: '',
    filter: n2k => n2k.fields['User ID'],
    value: function (n2k) {
      return {
        mmsi: padUserID(n2k)
      }
    }
  },
  {
    context: function (n2k) {
      return typeof n2k.fields['User ID'] !== 'undefined' ? 'sar.urn:mrn:imo:mmsi:' + padUserID(n2k) : undefined
    }
  },
  {
    node: 'sensors.ais.class',
    value: function (n2k) {
      return 'SAR'
    }
  }
]
