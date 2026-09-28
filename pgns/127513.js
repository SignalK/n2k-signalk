const { instancePrefix } = require('../instanceGroups')

module.exports = [
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.batteryType',
    value: n2k => n2k.fields.batteryType.toLowerCase(),
    filter: n2k => typeof n2k.fields.batteryType === 'string'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.supportsEqualization',
    value: n2k => n2k.fields.supportsEqualization === 'Yes',
    filter: n2k => typeof n2k.fields.supportsEqualization === 'string'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.nominalVoltage',
    value: n2k => n2k.fields.nominalVoltage,
    filter: n2k => typeof n2k.fields.nominalVoltage === 'string'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.chemistry',
    value: n2k => n2k.fields.chemistry.toLowerCase(),
    filter: n2k => typeof n2k.fields.chemistry === 'string'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.capacity.nominal',
    value: n2k => n2k.fields.capacity * 3600,
    filter: n2k => typeof n2k.fields.capacity === 'number'
  },
  {
    node: (n2k, state) =>
      instancePrefix(n2k, state) + '.temperatureCoefficient',
    value: n2k => n2k.fields.temperatureCoefficient,
    filter: n2k => typeof n2k.fields.temperatureCoefficient === 'number'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.peukertExponent',
    value: n2k => n2k.fields.peukertExponent,
    filter: n2k => typeof n2k.fields.peukertExponent === 'number'
  },
  {
    node: (n2k, state) =>
      instancePrefix(n2k, state) + '.chargeEfficiencyFactor',
    value: n2k => n2k.fields.chargeEfficiencyFactor,
    filter: n2k => typeof n2k.fields.chargeEfficiencyFactor === 'number'
  }
]
