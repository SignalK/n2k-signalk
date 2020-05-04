
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
    value: function (n2k) {
      return {
        mmsi: n2k.fields['User ID'].toString()
      }
    }
  },
  {
    context: function (n2k) {
      return 'sar.urn:mrn:imo:mmsi:' + n2k.fields['User ID']
    }
  }
]
