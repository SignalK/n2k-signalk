const { instancePrefix } = require('../instanceGroups')

module.exports = [
  {
    source: 'dcVoltage',
    node: (n2k, state) => instancePrefix(n2k, state) + '.voltage'
  },
  {
    source: 'dcCurrent',
    node: (n2k, state) => instancePrefix(n2k, state) + '.current'
  }
]
