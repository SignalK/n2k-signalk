import { PGN_129793 } from '@canboat/ts-pgns'

const padUserID = require('../mmsi-context').padUserID

module.exports = [
  {
    value: function (n2k: PGN_129793) {
      return {
        longitude: Number(n2k.fields.longitude),
        latitude: Number(n2k.fields.latitude)
      }
    },
    filter: function (n2k: PGN_129793) {
      return (
        typeof n2k.fields.longitude !== 'undefined' &&
        typeof n2k.fields.latitude !== 'undefined'
      )
    },
    node: 'navigation.position'
  },
  {
    node: '',
    filter: (n2k: PGN_129793) => n2k.fields.userId,
    value: function (n2k: PGN_129793) {
      return {
        mmsi: padUserID(n2k)
      }
    }
  },
  {
    context: function (n2k: PGN_129793) {
      return n2k.fields.userId != null
        ? 'shore.basestations.urn:mrn:imo:mmsi:' + padUserID(n2k)
        : undefined
    }
  },
  {
    node: 'sensors.ais.class',
    value: function (_n2k: PGN_129793) {
      return 'BASE'
    }
  }
]
