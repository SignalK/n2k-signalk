import { PGN_126992 } from '@canboat/ts-pgns'
import { isoDateTime } from '../utils.js'

module.exports = [
  {
    node: 'navigation.datetime',
    // canboatjs gives the time of day in seconds.
    value: (n2k: PGN_126992) => isoDateTime(n2k.fields.date, n2k.fields.time),
    filter: (n2k: PGN_126992) =>
      typeof n2k.fields.date !== 'undefined' &&
      typeof n2k.fields.time !== 'undefined'
  }
]
