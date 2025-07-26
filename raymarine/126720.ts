import {
  PGN_126720_Seatalk1DisplayBrightness,
  PGN_126720_Seatalk1DisplayColor,
  PGN_126720_Seatalk1PilotMode,
  PGN_126720_Seatalk1PilotHullType,
  SeatalkPilotMode,
  SeatalkPilotHullType
} from '@canboat/ts-pgns'

const debug = require('debug')('n2k-signalk-126720')
import camelCase from 'camelcase'

module.exports = [
  {
    // Display Brightness
    pgnClass: PGN_126720_Seatalk1DisplayBrightness,
    
    filter: function (n2k:PGN_126720_Seatalk1DisplayBrightness) {
      return (
        n2k.fields.group !== undefined
      )
    },
    node: (n2k:PGN_126720_Seatalk1DisplayBrightness) => {
      return `electrical.displays.raymarine.${camelCase(
        n2k.fields.group!.toString()
      )}.brightness`
    },
    allowNull: true,
    value: (n2k:PGN_126720_Seatalk1DisplayBrightness) => {
      let val = n2k.fields.brightness
      return val !== undefined ? val / 100.0 : null
    }
  },
  {
    // Display Color
    pgnClass: PGN_126720_Seatalk1DisplayColor,
    
    filter: function (n2k:PGN_126720_Seatalk1DisplayColor) {
      return (
        n2k.fields.group !== undefined &&
        n2k.fields.color !== undefined
      )
    },
    node: (n2k:PGN_126720_Seatalk1DisplayColor) => {
      return `electrical.displays.raymarine.${camelCase(
        n2k.fields.group!.toString()
      )}.color`
    },
    allowNull: true,
    value: (n2k:PGN_126720_Seatalk1DisplayColor) => {
      return camelCase(n2k.fields.color!.toString())
    }
  },
  {
    pgnClass: PGN_126720_Seatalk1PilotMode,
    
    // filters for SmartPilot behind Seatalk-STNG-Converter
    filter: function (n2k:PGN_126720_Seatalk1PilotMode) {
      return (
        typeof n2k.fields.pilotMode !== undefined &&
        typeof n2k.fields.subMode !== undefined
      )
    },
    node: 'steering.autopilot.state',
    value: function (n2k:PGN_126720_Seatalk1PilotMode) {
      var mode = n2k.fields.pilotMode
      var subMode = Number(n2k.fields.subMode)

      if ( n2k.fields.pilotMode == 10 ) {
      }
      
      if (
        (mode == 0 || mode == SeatalkPilotMode.Standby || mode == 68 || mode == 72) &&
        subMode == 0
      ) {
        return 'standby'
      } else if (
        mode == SeatalkPilotMode.Wind &&
        (subMode == 0 || subMode == 4 || subMode == 8 || subMode == 12)
      ) {
        // submodes: 0=on course,  4=off course pt/stb, 8=wind shift, submode 12 tbd
        return 'wind'
      } else if (mode == SeatalkPilotMode.Track && subMode == 0) {
        return 'route'
      } else if (mode == SeatalkPilotMode.Auto && (subMode == 0 || subMode == 4)) {
        //subMode 4 means offcourse
        return 'auto'
      } else {
        debug(
          'Unknown PGN 126720 AP state found - Mode: ' +
            mode +
            ', SubMode: ' +
            subMode
        )
        return
      }

      /*
      if ( mode == SeatalkPilotMode.Standby ) {
        return 'standby'
      } else if ( mode == SeatalkPilotMode.Wind ) {
        return 'wind'
      } else if (mode == 'Track') {
        return 'route'
      } else if (mode == 'Auto') {
        return 'auto'
      } else {
        debug(
          'Unknown PGN 126720 AP state found - Mode: ' +
            mode 
        )
        return
      }
        */
    }
  },
  {
    pgnClass: PGN_126720_Seatalk1PilotHullType,

    node: 'steering.autopilot.hullType',
    value: function (n2k: PGN_126720_Seatalk1PilotHullType) {
      switch (n2k.fields.hullType) {
        case SeatalkPilotHullType.Power:
          return 'power'
        case SeatalkPilotHullType.Sail:
          return 'sail'
        case SeatalkPilotHullType.SailCatamaran:
          return 'sailCatamaran'
        case SeatalkPilotHullType.SailslowTurn:
          return 'sailSlowTurn'
        case SeatalkPilotHullType.PowerfastTurn:
          return 'powerFastTurn'
        case SeatalkPilotHullType.PowerslowTurn:
          return 'powerSlowTurn'
        default:
          return 'unknown'
      }
    }
  }
]
