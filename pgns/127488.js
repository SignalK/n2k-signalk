const { chooseField } = require('../utils.js')

module.exports = [
  {
    node: 'propulsion.port.revolutions',
    filter: function (n2k) {
      return (
        chooseField(n2k, 'Engine Instance', 'Instance') ===
        'Single Engine or Dual Engine Port'
      )
    },
    value: function (n2k) {
      var rpm = Number(chooseField(n2k, 'Engine Speed', 'Speed'))
      return rpm / 60.0
    }
  },
  {
    node: 'propulsion.starboard.revolutions',
    filter: function (n2k) {
      return (
        chooseField(n2k, 'Engine Instance', ['Instance']) ===
        'Dual Engine Starboard'
      )
    },
    value: function (n2k) {
      var rpm = Number(chooseField(n2k, 'Engine Speed', 'Speed'))
      return rpm / 60.0
    }
  },
  {
    node: 'propulsion.port.drive.trimState',
    filter: function (n2k) {
      return (
        chooseField(n2k, 'Engine Instance', 'Instance') ===
        'Single Engine or Dual Engine Port'
        && typeof n2k.fields['Tilt/Trim'] !== 'undefined'
      )
    },
    value: function (n2k) {
      var trimPos = Number(n2k.fields['Tilt/Trim'])

      if(trimPos > 0){
        trimPos = trimPos/100
      }

      return trimPos
    }
  },
  {
    node: 'propulsion.starboard.drive.trimState',
    filter: function (n2k) {
      return (
        chooseField(n2k, 'Engine Instance', ['Instance']) ===
        'Dual Engine Starboard'
        && typeof n2k.fields['Tilt/Trim'] !== 'undefined'
      )
    },
    value: function (n2k) {
      var trimPos = Number(n2k.fields['Tilt/Trim'])

      if(trimPos > 0){
        trimPos = trimPos/100
      }

      return trimPos
    }
  }
]
