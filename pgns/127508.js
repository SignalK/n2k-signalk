const {chooseField} = require('../utils.js')

function instance(n2k) {
  return chooseField(n2k, 'Battery Instance', 'Instance')
}

module.exports = [
  {
    source: 'Voltage',
    node: function (n2k) {
      return (
        'electrical.batteries.' + instance(n2k) + '.voltage'
      )
    }
  },
  {
    source: 'Current',
    node: function (n2k) {
      return (
        'electrical.batteries.' + instance(n2k) + '.current'
      )
    }
  },
  {
    source: 'Temperature',
    node: function (n2k) {
      return (
        'electrical.batteries.' +
          instance(n2k) +
        '.temperature'
      )
    }
  }
]
