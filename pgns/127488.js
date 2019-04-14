const { chooseField, skEngineId } = require('../utils.js')

module.exports = [
  {
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.revolutions'
    },
    value: function (n2k) {
      var rpm = Number(chooseField(n2k, 'Engine Speed', 'Speed'))
      return rpm / 60.0
    }
  },
  {
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.drive.trimState'
    },
    value: function (n2k) {
      var trimPos = Number(n2k.fields['Tilt/Trim'])

      if (trimPos > 0) {
        trimPos = trimPos / 100
      }

      return trimPos
    },
    filter: function (n2k) {
      return typeof n2k.fields['Tilt/Trim'] !== 'undefined'
    }
  }
]
