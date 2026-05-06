function prefix (n2k) {
  return 'electrical.chargers.' + n2k.fields.instance
}

module.exports = [
  {
    node: n2k => prefix(n2k) + '.enabled',
    value: n2k => n2k.fields.chargerEnableDisable === 'On',
    filter: n2k => typeof n2k.fields.chargerEnableDisable === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.chargeCurrentLimit',
    value: n2k => n2k.fields.chargeCurrentLimit,
    filter: n2k => typeof n2k.fields.chargeCurrentLimit === 'number'
  },
  {
    node: n2k => prefix(n2k) + '.chargingAlgorithm',
    value: n2k => n2k.fields.chargingAlgorithm.toLowerCase(),
    filter: n2k => typeof n2k.fields.chargingAlgorithm === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.chargeMode',
    value: n2k => n2k.fields.chargerMode.toLowerCase(),
    filter: n2k => typeof n2k.fields.chargerMode === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.estimatedTemperature',
    value: n2k => n2k.fields.estimatedTemperature.toLowerCase(),
    filter: n2k => typeof n2k.fields.estimatedTemperature === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.equalizeOneTimeEnabled',
    value: n2k => n2k.fields.equalizeOneTimeEnableDisable === 'On',
    filter: n2k => typeof n2k.fields.equalizeOneTimeEnableDisable === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.overChargeEnabled',
    value: n2k => n2k.fields.overChargeEnableDisable === 'On',
    filter: n2k => typeof n2k.fields.overChargeEnableDisable === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.equalizeTime',
    value: n2k => n2k.fields.equalizeTime,
    filter: n2k => typeof n2k.fields.equalizeTime === 'number'
  }
]
