const debug = require('debug')('n2k-signalk-126720')
const camelCase = require('camelcase')

module.exports = [
  {
    // Display Brightness
    filter: function (n2k) {
      return (
        n2k.description === 'Seatalk1: Display Brightness' &&
        n2k.fields['Manufacturer Code'] === 'Raymarine' &&
        n2k.fields['Group'] !== undefined
      )
    },
    node: n2k => {
      return `electrical.displays.raymarine.${camelCase(
        n2k.fields['Group']
      )}.brightness`
    },
    allowNull: true,
    value: n2k => {
      let val = n2k.fields['Brightness']
      return val !== undefined ? val / 100.0 : null
    }
  },
  {
    // Display Color
    filter: function (n2k) {
      return (
        n2k.description === 'Seatalk1: Display Color' &&
        n2k.fields['Manufacturer Code'] === 'Raymarine' &&
        n2k.fields['Group'] !== undefined
      )
    },
    node: n2k => {
      return `electrical.displays.raymarine.${camelCase(
        n2k.fields['Group']
      )}.color`
    },
    allowNull: true,
    value: n2k => {
      return camelCase(n2k.fields['Color'])
    }
  },
  {
    // filters for SmartPilot behind Seatalk-STNG-Converter
    filter: function (n2k) {
      return (
        n2k.description === 'Seatalk1: Pilot Mode' &&
        n2k.fields['Manufacturer Code'] === 'Raymarine' &&
        typeof n2k.fields['Pilot Mode'] !== undefined &&
        typeof n2k.fields['Sub Mode'] !== undefined
      )
    },
    node: 'steering.autopilot.state',
    value: function (n2k) {
      var mode = n2k.fields['Pilot Mode']
      var subMode = Number(n2k.fields['Sub Mode'])
      if (
        (mode == 0 || mode == 'Standby' || mode == 68 || mode == 72) &&
        subMode == 0
      ) {
        return 'standby'
      } else if (
        mode == 'Wind' &&
        (subMode == 0 || subMode == 4 || subMode == 8 || subMode == 12)
      ) {
        // submodes: 0=on course,  4=off course pt/stb, 8=wind shift, submode 12 tbd
        return 'wind'
      } else if (mode == 'Track' && subMode == 0) {
        return 'route'
      } else if (mode == 'Auto' && (subMode == 0 || subMode == 4)) {
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
    }
  }
]
