const getMmsiContext = require('../mmsi-context').getMmsiContext
const getFromStarboard = require('../aisFromStarboard')
const getShipType = require('../aisShipTypeMapping')

module.exports = [
  {
    node: '',
    value: function (n2k) {
      return {
        name: n2k.fields.name
      }
    },
    filter: function (n2k) {
      return n2k.fields.name
    }
  },
  {
    node: 'design.length',
    value: function (n2k) {
      return { overall: Number(n2k.fields.length) }
    },
    filter: function (n2k) {
      return n2k.fields.length
    }
  },
  {
    node: 'design.aisShipType',
    value: function (n2k) {
      return getShipType(n2k.fields.typeOfShip)
    },
    filter: function (n2k) {
      return n2k.fields.typeOfShip
    }
  },
  {
    node: 'design.beam',
    source: 'beam',
    filter: function (n2k) {
      return n2k.fields.beam
    }
  },
  {
    node: 'sensors.ais.fromBow',
    source: 'positionReferenceFromBow'
  },
  {
    node: 'sensors.ais.fromCenter',
    value: getFromStarboard,
    filter: function (n2k) {
      return n2k.fields.positionReferenceFromStarboard && n2k.fields.beam
    }
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
  }
]
