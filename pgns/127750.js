function prefix (n2k) {
  return `electrical.converter.${n2k.src}.${n2k.fields['Connection Number']}`
}

module.exports = [
  {
    node: n2k => prefix(n2k) + '.operatingState',
    value: n2k => n2k.fields['Operating State'].toLowerCase(),
    filter: n2k => typeof n2k.fields['Operating State'] === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.temperatureState',
    value: n2k => n2k.fields['Temperature State'].toLowerCase(),
    filter: n2k => typeof n2k.fields['Temperature State'] === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.overloadState',
    value: n2k => n2k.fields['Overload State'].toLowerCase(),
    filter: n2k => typeof n2k.fields['Overload State'] === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.lowDCVoltageState',
    value: n2k => n2k.fields['Low DC Voltage State'].toLowerCase(),
    filter: n2k => typeof n2k.fields['Low DC Voltage State'] === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.rippleState',
    value: n2k => n2k.fields['Ripple State'].toLowerCase(),
    filter: n2k => typeof n2k.fields['Ripple State'] === 'string'
  }
]
