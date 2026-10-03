const { instancePrefix } = require('../instanceGroups')

module.exports = [
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.enabled',
    value: n2k => n2k.fields.chargerEnableDisable === 'On',
    filter: n2k => typeof n2k.fields.chargerEnableDisable === 'string'
  },
  // Not a current: the limit as a ratio (0-1) of the charger's designed
  // maximum output current (NMEA 2000 DD263, a percentage on the bus).
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.chargeCurrentLimit',
    value: n2k => n2k.fields.chargeCurrentLimit,
    filter: n2k => typeof n2k.fields.chargeCurrentLimit === 'number'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.chargingAlgorithm',
    value: n2k => n2k.fields.chargingAlgorithm.toLowerCase(),
    filter: n2k => typeof n2k.fields.chargingAlgorithm === 'string'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.chargeMode',
    value: n2k => n2k.fields.chargerMode.toLowerCase(),
    filter: n2k => typeof n2k.fields.chargerMode === 'string'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.estimatedTemperature',
    value: n2k => n2k.fields.estimatedTemperature.toLowerCase(),
    filter: n2k => typeof n2k.fields.estimatedTemperature === 'string'
  },
  {
    node: (n2k, state) =>
      instancePrefix(n2k, state) + '.equalizeOneTimeEnabled',
    value: n2k => n2k.fields.equalizeOneTimeEnableDisable === 'On',
    filter: n2k => typeof n2k.fields.equalizeOneTimeEnableDisable === 'string'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.overChargeEnabled',
    value: n2k => n2k.fields.overChargeEnableDisable === 'On',
    filter: n2k => typeof n2k.fields.overChargeEnableDisable === 'string'
  },
  {
    node: (n2k, state) => instancePrefix(n2k, state) + '.equalizeTime',
    value: n2k => n2k.fields.equalizeTime,
    filter: n2k => typeof n2k.fields.equalizeTime === 'number'
  }
]
