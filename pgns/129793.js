const padUserID = require('../mmsi-context').padUserID
const getFromStarboard = require('../aisFromStarboard')
const getShipType = require('../aisShipTypeMapping')

module.exports = [
  {
    value: function (n2k) {
      return {
        longitude: Number(n2k.fields.longitude),
        latitude: Number(n2k.fields.latitude)
      }
    },
    filter: function (n2k) {
      return (
        typeof n2k.fields.longitude !== 'undefined' &&
        typeof n2k.fields.latitude !== 'undefined'
      )
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
        ? 'shore.basestations.urn:mrn:imo:mmsi:' + padUserID(n2k)
        : 'shore.unknown'
    }
  },
  {
    node: 'sensors.ais.class',
    value: function (n2k) {
      return 'BASE'
    }
  }
]
