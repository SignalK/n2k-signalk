const { get } = require('lodash')

module.exports = function(type, phase) {
  function prefix(n2k) {
    return `electrical.${type}.0.${phase}`
  }
  
  return [
    {
      source: 'Real Power',
      node: function (n2k) {
        return `${prefix(n2k)}.realPower`
      }
    },
    {
      node: function (n2k) {
        return `${prefix(n2k)}.apparentPower`
      },
      value: (n2k, state) => {
        const pf = get(state, `maretron.${prefix(n2k)}.powerFactor`)
        return n2k.fields['Apparent Power'] * pf
      },
      filter: (n2k, state) => {
        return n2k.fields['Apparent Power'] != null &&
          get(state, `maretron.${prefix(n2k)}.powerFactor`) != null
      }
    }
  ]
}
