import {
  PGN_65305_SimnetPilotMode,
  SimnetApModeBitfield,
} from '@canboat/ts-pgns'

const modeMap: { [key: string]: SimnetApModeBitfield } = {
  'standby': SimnetApModeBitfield.Standby,
  'auto': SimnetApModeBitfield.NoDrift,
  'heading': SimnetApModeBitfield.Heading,
  'wind': SimnetApModeBitfield.Wind,
  'route': SimnetApModeBitfield.Nav
}

module.exports = [
  {
    pgnClass: PGN_65305_SimnetPilotMode,
    
    node: 'steering.autopilot.state',
    
    value: function (n2k: PGN_65305_SimnetPilotMode) {
      let res: string | undefined
      Object.keys(modeMap).forEach(key => {
        const mode = modeMap[key]
        if ( n2k.fields.mode?.indexOf(mode) != -1 ) {
          res = key
        }
      })
      return res
    }
  }
]
