const getMmsiContext = require('../mmsi-context').getMmsiContext
const getFromStarboard = require('../aisFromStarboard')
const getShipType = require('../aisShipTypeMapping')

module.exports = [
  {
    node: '',
    filter: n2k => n2k.fields.name,
    value: function (n2k) {
      return {
        name: n2k.fields.name
      }
    }
  },
  {
    source: 'destination',
    node: 'navigation.destination.commonName'
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
    source: 'sog',
    node: 'navigation.speedOverGround'
  },
  {
    source: 'cog',
    node: 'navigation.courseOverGroundTrue'
  },
  {
    source: 'trueHeading',
    node: 'navigation.headingTrue'
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
    source: 'beam'
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
  },
  {
    node: 'sensors.ais.class',
    value: function (n2k) {
      return 'B'
    }
  }
]
