import { PGN_127488 } from '@canboat/ts-pgns'
import { skEngineId } from '../utils.js'

module.exports = [
  {
    // Revolutions per second (Hz).
    source: 'speed',
    node: (n2k: PGN_127488) => `propulsion.${skEngineId(n2k)}.revolutions`
  },
  {
    // A ratio: 1 is fully trimmed out.
    source: 'tiltTrim',
    node: (n2k: PGN_127488) => `propulsion.${skEngineId(n2k)}.drive.trimState`
  },
  {
    source: 'boostPressure',
    node: (n2k: PGN_127488) => `propulsion.${skEngineId(n2k)}.boostPressure`
  }
]
