const { chooseField, timeToSeconds } = require('../utils.js')

function instance (n2k) {
  return chooseField(n2k, 'DC Instance', 'Instance')
}

module.exports = [
  {
    value: function (n2k) {
      return n2k.fields['State of Charge'] / 100
    },
    filter: function (n2k) {
      return typeof n2k.fields['State of Charge'] !== 'undefined'
    },
    node: function (n2k) {
      return 'electrical.batteries.' + instance(n2k) + '.capacity.stateOfCharge'
    }
  },
  {
    source: 'State of Health',
    node: function (n2k) {
      return 'electrical.batteries.' + instance(n2k) + '.capacity.stateOfHealth'
    }
  },
  {
    allowNull: true,
    value: function (n2k) {
      return timeToSeconds(n2k.fields['Time Remaining'])
    },
    node: function (n2k) {
      return 'electrical.batteries.' + instance(n2k) + '.capacity.timeRemaining'
    }
  } /*, {
    source: 'Ripple Voltage',
    node: function(n2k) {
      return 'electrical.batteries.' + instance(n2k) + '.voltage.ripple'
    }
  } */
]
