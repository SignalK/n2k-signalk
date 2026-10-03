import { PGN_129794 } from '@canboat/ts-pgns'
import { seconds } from '../utils.js'

const getMmsiContext = require('../mmsi-context').getMmsiContext
const getFromStarboard = require('../aisFromStarboard')
const getShipType = require('../aisShipTypeMapping')

/**
 * The ETA as an ISO date-time. canboatjs gives the date as "YYYY.MM.DD" and
 * the time of day in seconds. AIS marks an unknown hour as 24 and an unknown
 * minute as 60; either counts as 0.
 */
function eta(n2k: PGN_129794): string | undefined {
  const date = n2k.fields.etaDate as unknown
  if (typeof date !== 'string') {
    return undefined
  }
  const midnight = Date.parse(`${date.replace(/\./g, '-')}T00:00:00Z`)
  if (Number.isNaN(midnight)) {
    return undefined
  }
  const time = seconds(n2k.fields.etaTime) ?? 0
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor(time / 60) % 60
  const rest = time - Math.floor(time / 60) * 60
  const sinceMidnight =
    (hours > 23 ? 0 : hours) * 3600 + (minutes > 59 ? 0 : minutes) * 60 + rest
  return new Date(midnight + Math.round(sinceMidnight * 1000)).toISOString()
}

module.exports = [
  {
    node: 'sensors.ais.class',
    value: () => 'A'
  },
  {
    node: '',
    filter: (n2k: PGN_129794) => n2k.fields.name,
    value: (n2k: PGN_129794) => ({ name: n2k.fields.name })
  },
  {
    node: 'navigation.destination.commonName',
    value: (n2k: PGN_129794) => n2k.fields.destination
  },
  {
    node: 'navigation.destination.eta',
    value: eta
  },
  {
    node: 'design.draft',
    filter: (n2k: PGN_129794) => n2k.fields.draft,
    value: (n2k: PGN_129794) => ({ maximum: n2k.fields.draft })
  },
  {
    node: 'design.length',
    value: (n2k: PGN_129794) => ({ overall: Number(n2k.fields.length) }),
    filter: (n2k: PGN_129794) => n2k.fields.length
  },
  {
    node: 'design.aisShipType',
    value: (n2k: PGN_129794) => getShipType(n2k.fields.typeOfShip),
    filter: (n2k: PGN_129794) => n2k.fields.typeOfShip
  },
  {
    node: '',
    filter: (n2k: PGN_129794) => n2k.fields.callsign,
    value: (n2k: PGN_129794) => ({
      communication: { callsignVhf: n2k.fields.callsign }
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
    filter: (n2k: PGN_129794) =>
      n2k.fields.positionReferenceFromStarboard && n2k.fields.beam
  },
  {
    node: '',
    filter: (n2k: PGN_129794) => n2k.fields.userId,
    value: (n2k: PGN_129794) => ({ mmsi: n2k.fields.userId!.toString() })
  },
  {
    node: '',
    value: (n2k: PGN_129794) => ({
      registrations: { imo: `IMO ${n2k.fields.imoNumber}` }
    }),
    filter: (n2k: PGN_129794) =>
      n2k.fields.imoNumber && n2k.fields.imoNumber != 0
  },
  {
    context: getMmsiContext
  }
]
