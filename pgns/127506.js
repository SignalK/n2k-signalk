const { chooseField, timeToSeconds } = require('../utils.js')

function instance (n2k) {
  return n2k.fields.instance
}

module.exports = [
  {
    value: function (n2k) {
      return n2k.fields.stateOfCharge / 100
    },
    filter: function (n2k) {
      return typeof n2k.fields.stateOfCharge !== 'undefined'
    },
    node: function (n2k) {
      return 'electrical.batteries.' + instance(n2k) + '.capacity.stateOfCharge'
    }
  },
  {
    source: 'stateOfHealth',
    node: function (n2k) {
      return 'electrical.batteries.' + instance(n2k) + '.capacity.stateOfHealth'
    }
  },
  {
    allowNull: true,
    value: function (n2k) {
      return timeToSeconds(n2k.fields.timeRemaining)
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
