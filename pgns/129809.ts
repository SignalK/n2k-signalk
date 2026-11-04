import { PGN_129809 } from '@canboat/ts-pgns'

const getMmsiContext = require('../mmsi-context').getMmsiContext

module.exports = [
  {
    node: 'sensors.ais.class',
    filter: (n2k: PGN_129809) => n2k.fields.userId,
    value: function (_n2k: PGN_129809) {
      return 'B'
    }
  },
  {
    node: '',
    filter: (n2k: PGN_129809) => n2k.fields.name,
    value: function (n2k: PGN_129809) {
      return {
        name: n2k.fields.name
      }
    }
  },
  {
    node: '',
    filter: (n2k: PGN_129809) => n2k.fields.userId,
    value: function (n2k: PGN_129809) {
      return {
        mmsi: n2k.fields.userId!.toString()
      }
    }
  },
  {
    context: getMmsiContext,
    filter: (n2k: PGN_129809) => n2k.fields.userId
  }
]
