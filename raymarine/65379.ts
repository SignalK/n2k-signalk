import { PGN_65379_SeatalkPilotMode } from '@canboat/ts-pgns'

// canboat's SEATALK_PILOT_MODE_16. canboatjs gives a name, or the number
// when lookups are off. Sub Mode is a separate field that doesn't change the
// state.
const STATES = new Map<string | number, string>([
  ['Standby', 'standby'],
  [0, 'standby'],
  ['Auto, compass commanded', 'auto'],
  [64, 'auto'],
  ['Vane, Wind Mode', 'wind'],
  [256, 'wind'],
  ['Track Mode', 'route'],
  [384, 'route'],
  ['No Drift, COG referenced (In track, course changes)', 'route'],
  [385, 'route']
])

// Proprietary PGN numbers are shared between manufacturers, and canboatjs
// decodes another manufacturer's 65379 with the range's catch-all, which has
// no pilotMode: the filter keeps that record from being read as a mode.
module.exports = [
  {
    node: 'steering.autopilot.state',
    filter: (n2k: PGN_65379_SeatalkPilotMode) =>
      STATES.has(n2k.fields.pilotMode as string | number),
    value: (n2k: PGN_65379_SeatalkPilotMode) =>
      STATES.get(n2k.fields.pilotMode as string | number)
  }
]
