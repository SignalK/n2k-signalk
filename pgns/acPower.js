const { instancePrefix } = require('../instanceGroups')

module.exports = phase => {
  function prefix (n2k, state) {
    return `${instancePrefix(n2k, state)}.${phase}`
  }

  return [
    {
      node: (n2k, state) => prefix(n2k, state) + '.power',
      value: n2k => n2k.fields.power,
      filter: n2k => typeof n2k.fields.power !== 'undefined'
    },
    {
      node: (n2k, state) => prefix(n2k, state) + '.current',
      value: n2k => n2k.fields.acRmsCurrent,
      filter: n2k => typeof n2k.fields.acRmsCurrent !== 'string'
    }
  ]
}
