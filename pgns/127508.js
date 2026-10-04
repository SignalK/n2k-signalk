const { chooseField } = require('../utils.js')
const { instancePrefix } = require('../instanceGroups')

module.exports = [
  {
    source: 'voltage',
    node: function (n2k, state) {
      return instancePrefix(n2k, state) + '.voltage'
    }
  },
  {
    source: 'current',
    node: function (n2k, state) {
      return instancePrefix(n2k, state) + '.current'
    }
  },
  {
    source: 'temperature',
    node: function (n2k, state) {
      return instancePrefix(n2k, state) + '.temperature'
    }
  }
]
