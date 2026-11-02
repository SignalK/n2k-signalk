import { PGN_129810 } from '@canboat/ts-pgns'

const getMmsiContext = require('../mmsi-context').getMmsiContext
const getFromStarboard = require('../aisFromStarboard')
const getShipType = require('../aisShipTypeMapping')

module.exports = [
  {
    node: 'design.length',
    value: function (n2k: PGN_129810) {
      return { overall: Number(n2k.fields.length) }
    },
    filter: function (n2k: PGN_129810) {
      return n2k.fields.length
    }
  },
  {
    node: 'design.aisShipType',
    value: function (n2k: PGN_129810) {
      return getShipType(n2k.fields.typeOfShip)
    },
    filter: function (n2k: PGN_129810) {
      return n2k.fields.typeOfShip
    }
  },
  {
    node: 'design.beam',
    source: 'beam'
  },
  {
    node: '',
    filter: (n2k: PGN_129810) => n2k.fields.callsign,
    value: (n2k: PGN_129810) => ({
      communication: {
        callsignVhf: n2k.fields.callsign
      }
    })
  },
  {
    node: 'sensors.ais.fromBow',
    source: 'positionReferenceFromBow'
  },
  {
    node: 'sensors.ais.fromCenter',
    value: getFromStarboard,
    filter: function (n2k: PGN_129810) {
      return n2k.fields.positionReferenceFromStarboard && n2k.fields.beam
    }
  },
  {
    node: '',
    filter: (n2k: PGN_129810) => n2k.fields.userId,
    value: function (n2k: PGN_129810) {
      return {
        mmsi: n2k.fields.userId!.toString()
      }
    }
  },
  {
    context: getMmsiContext
  }
]
