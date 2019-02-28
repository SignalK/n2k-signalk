const { chooseField, skEngineId } = require('../utils.js')

module.exports = [
  {
    node: function (n2k) { return 'propulsion.' + skEngineId(n2k) + '.revolutions' },
    value: function (n2k) {
      var rpm = Number(chooseField(n2k, 'Engine Speed', 'Speed'))
      return rpm / 60.0
    }
  },
  {
    node: function (n2k) { return 'propulsion.' + skEngineId(n2k) + '.trimPosition' },
    value: function (n2k) {
      var trimPos = n2k.fields['Tilt/Trim']
      return trimPos
    }
  }
]
