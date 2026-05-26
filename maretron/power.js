const { get } = require('lodash')

module.exports = function(type, phase) {
  function prefix(n2k, state) {
    return `electrical.${type}.${state.deviceInstance || 0}.${phase}`
  }
  
  return [
    {
      source: 'realPower',
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.realPower`
      },
      filter: (n2k, state) => {
        return state.deviceInstance != null
      }
    },
    {
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.apparentPower`
      },
      value: (n2k, state) => {
        const pf = get(state, `maretron.${prefix(n2k, state)}.powerFactor`)
        return n2k.fields.apparentPower * pf
      },
      filter: (n2k, state) => {
        return n2k.fields.apparentPower != null &&
          get(state, `maretron.${prefix(n2k, state)}.powerFactor`) != null &&
          state.deviceInstance != null
      }
    }
  ]
}
