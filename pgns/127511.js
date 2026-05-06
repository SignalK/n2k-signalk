function prefix (n2k) {
  return 'electrical.inverters.' + n2k.fields.instance
}

module.exports = [
  {
    node: n2k => prefix(n2k) + '.enabled',
    value: n2k => n2k.fields.inverterEnableDisable === 'On',
    filter: n2k => typeof n2k.fields.inverterEnableDisable === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.inverterMode',
    value: n2k => n2k.fields.inverterMode.toLowerCase(),
    filter: n2k => typeof n2k.fields.inverterMode === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.loadSenseEnabled',
    value: n2k => n2k.fields.loadSenseEnableDisable === 'On',
    filter: n2k => typeof n2k.fields.loadSenseEnableDisable === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.loadSensePowerThreshold',
    value: n2k => n2k.fields.loadSensePowerThreshold,
    filter: n2k => typeof n2k.fields.loadSensePowerThreshold === 'number'
  },
  {
    node: n2k => prefix(n2k) + '.loadSenseInterval',
    value: n2k => n2k.fields.loadSenseInterval,
    filter: n2k => typeof n2k.fields.loadSenseInterval === 'number'
  }
]
