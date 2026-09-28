const { chooseField, timeToSeconds } = require('../utils.js')
const { instancePrefix } = require('../instanceGroups')

module.exports = [
  {
    value: function (n2k) {
      return n2k.fields.stateOfCharge / 100
    },
    filter: function (n2k) {
      return typeof n2k.fields.stateOfCharge !== 'undefined'
    },
    node: function (n2k, state) {
      return instancePrefix(n2k, state) + '.capacity.stateOfCharge'
    }
  },
  {
    value: function (n2k) {
      return n2k.fields.stateOfHealth / 100
    },
    filter: function (n2k) {
      return typeof n2k.fields.stateOfHealth !== 'undefined'
    },
    node: function (n2k, state) {
      return instancePrefix(n2k, state) + '.capacity.stateOfHealth'
    }
  },
  {
    allowNull: true,
    value: function (n2k) {
      return timeToSeconds(n2k.fields.timeRemaining)
    },
    node: function (n2k, state) {
      return instancePrefix(n2k, state) + '.capacity.timeRemaining'
    }
  } /*, {
    source: 'Ripple Voltage',
    node: function(n2k) {
      return 'electrical.batteries.' + instance(n2k) + '.voltage.ripple'
    }
  } */
]
