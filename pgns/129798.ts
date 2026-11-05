import { PGN_129798 } from '@canboat/ts-pgns'
import { isNumber } from '../utils.js'

const padUserID = require('../mmsi-context').padUserID

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
    filter: (n2k: PGN_129798) =>
      isNumber(n2k.fields.longitude) && isNumber(n2k.fields.latitude),
    value: function (n2k: PGN_129798) {
      const res: { longitude: number; latitude: number; altitude?: number } = {
        longitude: Number(n2k.fields.longitude),
        latitude: Number(n2k.fields.latitude)
      }
      if (typeof n2k.fields.altitude !== 'undefined') {
        res.altitude = Number(n2k.fields.altitude)
      }
      return res
    },
    node: 'navigation.position'
  },
  {
    node: '',
    filter: (n2k: PGN_129798) => n2k.fields.userId,
    value: function (n2k: PGN_129798) {
      return {
        mmsi: padUserID(n2k)
      }
    }
  },
  {
    context: function (n2k: PGN_129798) {
      return n2k.fields.userId != null
        ? 'sar.urn:mrn:imo:mmsi:' + padUserID(n2k)
        : undefined
    }
  },
  {
    node: 'sensors.ais.class',
    value: function (_n2k: PGN_129798) {
      return 'SAR'
    }
  }
]
