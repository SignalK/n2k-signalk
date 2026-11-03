import {
  PGN_65305_SimnetPilotMode,
  SimnetApModeBitfield
} from '@canboat/ts-pgns'

// The specification's autopilot state of each Simnet mode: Heading holds
// a heading, which is the specification's auto, as Raymarine's 65379
// writes its compass-commanded mode (#392). When a frame sets several mode
// bits, the last one listed wins.
const modeMap: { [key: string]: SimnetApModeBitfield } = {
  standby: SimnetApModeBitfield.Standby,
  noDrift: SimnetApModeBitfield.NoDrift,
  auto: SimnetApModeBitfield.Heading,
  wind: SimnetApModeBitfield.Wind,
  route: SimnetApModeBitfield.Nav
}

module.exports = [
  {
    pgnClass: PGN_65305_SimnetPilotMode,

    node: 'steering.autopilot.state',

    value: function (n2k: PGN_65305_SimnetPilotMode) {
      let res: string | undefined
      Object.keys(modeMap).forEach(key => {
        const mode = modeMap[key]
        if (n2k.fields.mode?.indexOf(mode) != -1) {
          res = key
        }
      })
      return res
    }
  }
]
