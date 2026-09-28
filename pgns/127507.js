const { timeToSeconds } = require('../utils.js')
const { instancePrefix } = require('../instanceGroups')

module.exports = [
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.operatingState',
    value: n2k => n2k.fields.operatingState.toLowerCase(),
    filter: n2k => typeof n2k.fields.operatingState === 'string'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.chargeMode',
    value: n2k => n2k.fields.chargeMode.toLowerCase(),
    filter: n2k => typeof n2k.fields.chargeMode === 'string'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.enabled',
    value: n2k => n2k.fields.enabled === 'On',
    filter: n2k => typeof n2k.fields.enabled === 'string'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.equalizationPending',
    value: n2k => n2k.fields.equalizationPending === 'On',
    filter: n2k => typeof n2k.fields.equalizationPending === 'string'
  },
  {
    allowNull: true,
    node: (n2k, state) =>
      instancePrefix(n2k, state) + '.equalizationTimeRemaining',
    value: n2k => timeToSeconds(n2k.fields.equalizationTimeRemaining)
  }
]
