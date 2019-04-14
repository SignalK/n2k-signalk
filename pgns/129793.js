const getMmsiContext = require('../mmsi-context')
const getFromStarboard = require('../aisFromStarboard')
const getShipType = require('../aisShipTypeMapping')

module.exports = [
  {
    value: function (n2k) {
      return {
        longitude: Number(n2k.fields.Longitude),
        latitude: Number(n2k.fields.Latitude)
      }
    },
    filter: function (n2k) {
      return (
        typeof n2k.fields['Longitude'] !== 'undefined' &&
        typeof n2k.fields['Latitude'] !== 'undefined'
      )
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
      return 'shore.basestations.urn:mrn:imo:mmsi:' + n2k.fields['User ID']
    }
  }
]
