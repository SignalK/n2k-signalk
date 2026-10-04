import { PGN_127488 } from '@canboat/ts-pgns'
const { instancePrefix } = require('../instanceGroups')

module.exports = [
  {
    // Revolutions per second (Hz).
    source: 'speed',
    node: (n2k: PGN_127488, state: any) =>
      `${instancePrefix(n2k, state)}.revolutions`
  },
  {
    // A ratio: 1 is fully trimmed out.
    source: 'tiltTrim',
    node: (n2k: PGN_127488, state: any) =>
      `${instancePrefix(n2k, state)}.drive.trimState`
  },
  {
    source: 'boostPressure',
    node: (n2k: PGN_127488, state: any) =>
      `${instancePrefix(n2k, state)}.boostPressure`
  }
]
