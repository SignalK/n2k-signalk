function prefix (n2k) {
  return `electrical.converter.${n2k.src}.${n2k.fields.connectionNumber}`
}

module.exports = [
  {
    node: n2k => prefix(n2k) + '.operatingState',
    value: n2k => n2k.fields.operatingState.toLowerCase(),
    filter: n2k => typeof n2k.fields.operatingState === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.temperatureState',
    value: n2k => n2k.fields.temperatureState.toLowerCase(),
    filter: n2k => typeof n2k.fields.temperatureState === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.overloadState',
    value: n2k => n2k.fields.overloadState.toLowerCase(),
    filter: n2k => typeof n2k.fields.overloadState === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.lowDCVoltageState',
    value: n2k => n2k.fields.lowDcVoltageState.toLowerCase(),
    filter: n2k => typeof n2k.fields.lowDcVoltageState === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.rippleState',
    value: n2k => n2k.fields.rippleState.toLowerCase(),
    filter: n2k => typeof n2k.fields.rippleState === 'string'
  }
]
