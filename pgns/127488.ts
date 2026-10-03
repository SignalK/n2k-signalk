import { PGN_127488 } from '@canboat/ts-pgns'
import { skEngineId } from '../utils.js'

module.exports = [
  {
    // Hz, as canboatjs gives rpm in SI.
    source: 'speed',
    node: (n2k: PGN_127488) => `propulsion.${skEngineId(n2k)}.revolutions`
  },
  {
    // A ratio, as canboatjs gives a percentage.
    source: 'tiltTrim',
    node: (n2k: PGN_127488) => `propulsion.${skEngineId(n2k)}.drive.trimState`
  },
  {
    source: 'boostPressure',
    node: (n2k: PGN_127488) => `propulsion.${skEngineId(n2k)}.boostPressure`
  }
]
