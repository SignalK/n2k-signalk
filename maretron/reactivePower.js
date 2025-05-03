const { set } = require('lodash')


module.exports = (type, phase) => {
  function prefix(n2k, state) {
    return `electrical.${type}.${state.deviceInstance || 0}.${phase}`
  }
  
  return [
    { 
      source: 'reactivePower',
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.reactivePower`
      },
      filter: (n2k, state) => {
        return state.deviceInstance != null
      }
    },
    {
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.powerFactor`
      },
      value: (n2k, state) => {
      const val = n2k.fields.powerFactor
        set(state, `maretron.${prefix(n2k, state)}.powerFactor`, val)
        return val / 32768
      },
      filter: (n2k, state) => {
        return n2k.fields.powerFactor != null &&
          state.deviceInstance != null
      }
    },
    {
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.powerFactorLagging`
      },
      value: (n2k) => {
        return n2k.fields.powerFactorLagging.toLowerCase()
      },
      filter: (n2k, state) => {
        return n2k.fields.powerFactorLagging != null &&
          state.deviceInstance != null
      }
    },
  ]
}
