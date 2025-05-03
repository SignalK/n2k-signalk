function prefix (n2k) {
  return `electrical.dc.${n2k.src}.${n2k.fields.connectionNumber}`
}

module.exports = [
  {
    source: 'dcVoltage',
    node: n2k => prefix(n2k) + '.voltage'
  },
  {
    source: 'dcCurrent',
    node: n2k => prefix(n2k) + '.current'
  }
]
