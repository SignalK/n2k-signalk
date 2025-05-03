const { chooseField } = require('../utils.js')

function instance (n2k) {
  return n2k.fields.instance
}

module.exports = [
  {
    source: 'voltage',
    node: function (n2k) {
      return 'electrical.batteries.' + instance(n2k) + '.voltage'
    }
  },
  {
    source: 'current',
    node: function (n2k) {
      return 'electrical.batteries.' + instance(n2k) + '.current'
    }
  },
  {
    source: 'temperature',
    node: function (n2k) {
      return 'electrical.batteries.' + instance(n2k) + '.temperature'
    }
  }
]
