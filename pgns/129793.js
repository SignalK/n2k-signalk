const padUserID = require('../mmsi-context').padUserID
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
    filter: n2k => n2k.fields['User ID'],
    value: function (n2k) {
      return {
        mmsi: padUserID(n2k)
      }
    }
  },
  {
    context: function (n2k) {
      return typeof n2k.fields['User ID'] !== 'undefined' ? 'shore.basestations.urn:mrn:imo:mmsi:' + padUserID(n2k) : undefined
    }
  },
  {
    node: 'sensors.ais.class',
    value: function (n2k) {
      return 'BASE'
    }
  }
]
