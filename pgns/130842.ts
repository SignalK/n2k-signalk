import {
  PGN_130842_SimnetAisClassBStaticDataMsg24PartA,
  PGN_130842_SimnetAisClassBStaticDataMsg24PartB
} from '@canboat/ts-pgns'

// Part A carries the name, part B the rest; every mapping reads either.
type Ais = {
  fields: Partial<
    PGN_130842_SimnetAisClassBStaticDataMsg24PartA['fields'] &
      PGN_130842_SimnetAisClassBStaticDataMsg24PartB['fields']
  >
}

const getMmsiContext = require('../mmsi-context').getMmsiContext
const getFromStarboard = require('../aisFromStarboard')
const getShipType = require('../aisShipTypeMapping')

module.exports = [
  {
    node: '',
    value: function (n2k: Ais) {
      return {
        name: n2k.fields.name
      }
    },
    filter: function (n2k: Ais) {
      return n2k.fields.name
    }
  },
  {
    node: 'design.length',
    value: function (n2k: Ais) {
      return { overall: Number(n2k.fields.length) }
    },
    filter: function (n2k: Ais) {
      return n2k.fields.length
    }
  },
  {
    node: 'design.aisShipType',
    value: function (n2k: Ais) {
      return getShipType(n2k.fields.typeOfShip)
    },
    filter: function (n2k: Ais) {
      return n2k.fields.typeOfShip
    }
  },
  {
    node: 'design.beam',
    source: 'beam',
    filter: function (n2k: Ais) {
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
    filter: function (n2k: Ais) {
      return n2k.fields.positionReferenceFromStarboard && n2k.fields.beam
    }
  },
  {
    node: '',
    filter: (n2k: Ais) => n2k.fields.userId,
    value: function (n2k: Ais) {
      return {
        mmsi: n2k.fields.userId!.toString()
      }
    }
  },
  {
    context: getMmsiContext
  }
]
