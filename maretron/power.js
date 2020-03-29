const { get } = require('lodash')

module.exports = function(type, phase) {
  function prefix(n2k, state) {
    return `electrical.${type}.${state.deviceInstance || 0}.${phase}`
  }
  
  return [
    {
      source: 'Real Power',
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.realPower`
      }
    },
    {
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.apparentPower`
      },
      value: (n2k, state) => {
        const pf = get(state, `maretron.${prefix(n2k, state)}.powerFactor`)
        return n2k.fields['Apparent Power'] * pf
      },
      filter: (n2k, state) => {
        return n2k.fields['Apparent Power'] != null &&
          get(state, `maretron.${prefix(n2k, state)}.powerFactor`) != null
      }
    }
  ]
}
