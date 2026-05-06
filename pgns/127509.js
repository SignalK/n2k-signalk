function prefix (n2k) {
  return 'electrical.inverters.' + n2k.fields.instance
}

module.exports = [
  {
    node: n2k => prefix(n2k) + '.operatingState',
    value: n2k => n2k.fields.operatingState.toLowerCase(),
    filter: n2k => typeof n2k.fields.operatingState === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.enabled',
    value: n2k => n2k.fields.inverterEnable === 'On',
    filter: n2k => typeof n2k.fields.inverterEnable === 'string'
  }
]
