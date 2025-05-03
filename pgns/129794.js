const getMmsiContext = require('../mmsi-context').getMmsiContext
const getFromStarboard = require('../aisFromStarboard')
const getShipType = require('../aisShipTypeMapping')

module.exports = [
  {
    node: 'sensors.ais.class',
    value: function (n2k) {
      return 'A'
    }
  },
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
    node: 'navigation.destination.commonName',
    value: n2k => n2k.fields.destination
  },
  {
    node: 'design.draft',
    filter: function (n2k) {
      return n2k.fields.draft
    },
    value: function (n2k) {
      return { maximum: n2k.fields.draft }
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
    node: '',
    filter: n2k => n2k.fields.callsign,
    value: n2k => ({
      communication: {
        callsignVhf: n2k.fields.callsign
      }
    })
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
      return (
        n2k.fields.positionReferenceFromStarboard && n2k.fields.beam
      )
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
    node: '',
    value: function (n2k) {
      return {
        registrations: {
          imo: `IMO ${n2k.fields.imoNumber}`
        }
      }
    },
    filter: function (n2k) {
      return n2k.fields.imoNumber && n2k.fields.imoNumber != 0
    }
  },
  {
    context: getMmsiContext
  }
]
