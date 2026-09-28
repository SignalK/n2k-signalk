const { instancePrefix } = require('../instanceGroups')

module.exports = [
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.operatingState',
    value: n2k => n2k.fields.operatingState.toLowerCase(),
    filter: n2k => typeof n2k.fields.operatingState === 'string'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.enabled',
    value: n2k => n2k.fields.inverterEnable === 'On',
    filter: n2k => typeof n2k.fields.inverterEnable === 'string'
  }
]
