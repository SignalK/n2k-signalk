function prefix (n2k) {
  return 'electrical.batteries.' + n2k.fields.instance
}

module.exports = [
  {
    node: n2k => prefix(n2k) + '.batteryType',
    value: n2k => n2k.fields.batteryType.toLowerCase(),
    filter: n2k => typeof n2k.fields.batteryType === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.supportsEqualization',
    value: n2k => n2k.fields.supportsEqualization === 'Yes',
    filter: n2k => typeof n2k.fields.supportsEqualization === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.nominalVoltage',
    value: n2k => n2k.fields.nominalVoltage,
    filter: n2k => typeof n2k.fields.nominalVoltage === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.chemistry',
    value: n2k => n2k.fields.chemistry.toLowerCase(),
    filter: n2k => typeof n2k.fields.chemistry === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.capacity.nominal',
    value: n2k => n2k.fields.capacity * 3600,
    filter: n2k => typeof n2k.fields.capacity === 'number'
  },
  {
    node: n2k => prefix(n2k) + '.temperatureCoefficient',
    value: n2k => n2k.fields.temperatureCoefficient,
    filter: n2k => typeof n2k.fields.temperatureCoefficient === 'number'
  },
  {
    node: n2k => prefix(n2k) + '.peukertExponent',
    value: n2k => n2k.fields.peukertExponent,
    filter: n2k => typeof n2k.fields.peukertExponent === 'number'
  },
  {
    node: n2k => prefix(n2k) + '.chargeEfficiencyFactor',
    value: n2k => n2k.fields.chargeEfficiencyFactor,
    filter: n2k => typeof n2k.fields.chargeEfficiencyFactor === 'number'
  }
]
