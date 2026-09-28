const { instancePrefix } = require('../instanceGroups')

module.exports = [
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.enabled',
    value: n2k => n2k.fields.inverterEnableDisable === 'On',
    filter: n2k => typeof n2k.fields.inverterEnableDisable === 'string'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.inverterMode',
    value: n2k => n2k.fields.inverterMode.toLowerCase(),
    filter: n2k => typeof n2k.fields.inverterMode === 'string'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.loadSenseEnabled',
    value: n2k => n2k.fields.loadSenseEnableDisable === 'On',
    filter: n2k => typeof n2k.fields.loadSenseEnableDisable === 'string'
  },
  {
    node: (n2k, state) =>
      instancePrefix(n2k, state) + '.loadSensePowerThreshold',
    value: n2k => n2k.fields.loadSensePowerThreshold,
    filter: n2k => typeof n2k.fields.loadSensePowerThreshold === 'number'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.loadSenseInterval',
    value: n2k => n2k.fields.loadSenseInterval,
    filter: n2k => typeof n2k.fields.loadSenseInterval === 'number'
  }
]
