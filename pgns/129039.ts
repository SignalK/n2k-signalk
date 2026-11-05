import { PGN_129039 } from '@canboat/ts-pgns'
import { isPosition } from '../utils.js'

const getMmsiContext = require('../mmsi-context').getMmsiContext

module.exports = [
  {
    source: 'sog',
    node: 'navigation.speedOverGround'
  },
  {
    source: 'cog',
    node: 'navigation.courseOverGroundTrue'
  },
  {
    filter: (n2k: PGN_129039) =>
      isPosition(n2k.fields.latitude, n2k.fields.longitude),
    value: function (n2k: PGN_129039) {
      return {
        longitude: Number(n2k.fields.longitude),
        latitude: Number(n2k.fields.latitude)
      }
    },
    node: 'navigation.position'
  },
  {
    source: 'heading',
    node: 'navigation.headingTrue'
  },
  {
    node: '',
    filter: (n2k: PGN_129039) => n2k.fields.userId,
    value: function (n2k: PGN_129039) {
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
    value: function (_n2k: PGN_129039) {
      return 'B'
    }
  }
]
