import { PGN_129029 } from '@canboat/ts-pgns'
import { isoDateTime } from '../utils.js'

const typeMap: Record<string, string> = {
  'GPS+GLONASS': 'Combined GPS/GLONASS',
  integrated: 'Integrated navigation system',
  surveyed: 'Surveyed'
}

const methodQualityMap: Record<string, string> = {
  'no GNSS': 'no GPS',
  'GNSS fix': 'GNSS Fix',
  'RTK Fixed Integer': 'RTK fixed integer',
  'Simulate mode': 'Simulator mode'
}

const integrityMap: Record<string, string> = {
  'No integrity checking': 'no Integrity checking'
}

const mapped =
  (field: 'gnssType' | 'method' | 'integrity', map: Record<string, string>) =>
  (n2k: PGN_129029) => {
    const value = n2k.fields[field] as unknown as string
    return map[value] || value
  }

module.exports = [
  {
    node: 'navigation.position',
    value: (n2k: PGN_129029) => ({
      longitude: Number(n2k.fields.longitude),
      latitude: Number(n2k.fields.latitude)
    }),
    filter: (n2k: PGN_129029) =>
      n2k.fields.longitude != null && n2k.fields.latitude != null
  },
  {
    node: 'navigation.datetime',
    // canboatjs gives the time of day in seconds.
    value: (n2k: PGN_129029) => isoDateTime(n2k.fields.date, n2k.fields.time),
    filter: (n2k: PGN_129029) =>
      typeof n2k.fields.date !== 'undefined' &&
      typeof n2k.fields.time !== 'undefined'
  },
  { source: 'altitude', node: 'navigation.gnss.antennaAltitude' },
  { source: 'numberOfSvs', node: 'navigation.gnss.satellites' },
  { source: 'hdop', node: 'navigation.gnss.horizontalDilution' },
  { source: 'pdop', node: 'navigation.gnss.positionDilution' },
  { source: 'geoidalSeparation', node: 'navigation.gnss.geoidalSeparation' },
  {
    source: 'ageOfDgnssCorrections',
    node: 'navigation.gnss.differentialAge'
  },
  {
    source: 'referenceStationId',
    node: 'navigation.gnss.differentialReference'
  },
  { node: 'navigation.gnss.type', value: mapped('gnssType', typeMap) },
  {
    node: 'navigation.gnss.methodQuality',
    value: mapped('method', methodQualityMap)
  },
  {
    node: 'navigation.gnss.integrity',
    value: mapped('integrity', integrityMap)
  }
]
