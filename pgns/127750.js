const { instancePrefix } = require('../instanceGroups')

module.exports = [
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.operatingState',
    value: n2k => n2k.fields.operatingState.toLowerCase(),
    filter: n2k => typeof n2k.fields.operatingState === 'string'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.temperatureState',
    value: n2k => n2k.fields.temperatureState.toLowerCase(),
    filter: n2k => typeof n2k.fields.temperatureState === 'string'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.overloadState',
    value: n2k => n2k.fields.overloadState.toLowerCase(),
    filter: n2k => typeof n2k.fields.overloadState === 'string'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.lowDCVoltageState',
    value: n2k => n2k.fields.lowDcVoltageState.toLowerCase(),
    filter: n2k => typeof n2k.fields.lowDcVoltageState === 'string'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.rippleState',
    value: n2k => n2k.fields.rippleState.toLowerCase(),
    filter: n2k => typeof n2k.fields.rippleState === 'string'
  }
]
