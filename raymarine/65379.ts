import { PGN_65379_SeatalkPilotMode } from '@canboat/ts-pgns'

// Proprietary PGN numbers are shared between manufacturers, and canboatjs
// decodes another manufacturer's 65379 with the range's catch-all, which has
// no pilotMode: the filter keeps that record from being read as a mode.
module.exports = [
  {
    node: 'steering.autopilot.state',
    filter: (n2k: PGN_65379_SeatalkPilotMode) =>
      n2k.fields.pilotMode !== undefined && n2k.fields.pilotMode !== null,
    value: function (n2k: PGN_65379_SeatalkPilotMode) {
      const mode = n2k.fields.pilotMode
      if (typeof mode === 'string') {
        if (mode === 'Standby') {
          return 'standby'
        } else if (mode === 'Auto, compass commanded') {
          return 'auto'
        } else if (mode === 'Vane, Wind Mode') {
          return 'wind'
        } else if (mode === 'Track Mode') {
          return 'route'
        } else if (
          mode === 'No Drift, COG referenced (In track, course changes)'
        ) {
          return 'route'
        }
      } else {
        const modeNumber = Number(mode)
        const subMode = Number(n2k.fields.subMode)
        if (modeNumber == 0 && subMode == 0) return 'standby'
        else if (modeNumber == 0 && subMode == 1) return 'wind'
        else if ((modeNumber == 128 || modeNumber == 129) && subMode == 1)
          return 'route'
        else if (modeNumber == 64 && subMode == 0) return 'auto'
        else return 'standby'
      }
    }
  }
]
