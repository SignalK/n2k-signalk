function prefix (n2k) {
  return `electrical.dc.${n2k.src}.${n2k.fields['Connection Number']}`
}

module.exports = [
  {
    source: 'DC Voltage',
    node: n2k => prefix(n2k) + '.voltage'
  },
  {
    source: 'DC Current',
    node: n2k => prefix(n2k) + '.current'
  }
]
