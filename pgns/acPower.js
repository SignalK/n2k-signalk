module.exports = phase => {
  function prefix (n2k) {
    return `electrical.ac.${n2k.src}.${n2k.fields.connectionNumber}.${phase}`
  }

  return [
    {
      node: n2k => prefix(n2k) + '.power',
      value: n2k => n2k.fields.power,
      filter: n2k => typeof n2k.fields.power !== 'undefined'
    },
    {
      node: n2k => prefix(n2k) + '.current',
      value: n2k => n2k.fields.acRmsCurrent,
      filter: n2k => typeof n2k.fields.acRmsCurrent !== 'string'
    }
  ]
}
