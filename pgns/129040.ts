import { PGN_129040 } from '@canboat/ts-pgns'
import { isNumber } from '../utils.js'

const getMmsiContext = require('../mmsi-context').getMmsiContext
const getFromStarboard = require('../aisFromStarboard')
const getShipType = require('../aisShipTypeMapping')

module.exports = [
  {
    node: '',
    filter: (n2k: PGN_129040) => n2k.fields.name,
    value: function (n2k: PGN_129040) {
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
    filter: (n2k: PGN_129040) =>
      isNumber(n2k.fields.longitude) && isNumber(n2k.fields.latitude),
    value: function (n2k: PGN_129040) {
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
    value: function (n2k: PGN_129040) {
      return { overall: Number(n2k.fields.length) }
    },
    filter: function (n2k: PGN_129040) {
      return isNumber(n2k.fields.length)
    }
  },
  {
    node: 'design.aisShipType',
    value: function (n2k: PGN_129040) {
      return getShipType(n2k.fields.typeOfShip)
    },
    filter: function (n2k: PGN_129040) {
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
    filter: function (n2k: PGN_129040) {
      return (
        isNumber(n2k.fields.positionReferenceFromStarboard) &&
        isNumber(n2k.fields.beam)
      )
    }
  },
  {
    node: '',
    filter: (n2k: PGN_129040) => n2k.fields.userId,
    value: function (n2k: PGN_129040) {
      return {
        mmsi: n2k.fields.userId!.toString()
      }
    }
  },
  {
    context: getMmsiContext
  },
  {
    node: 'sensors.ais.class',
    value: function (_n2k: PGN_129040) {
      return 'B'
    }
  }
]
