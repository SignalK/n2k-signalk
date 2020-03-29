const { set } = require('lodash')


module.exports = (type, phase) => {
  function prefix(n2k, state) {
    return `electrical.${type}.${state.deviceInstance || 0}.${phase}`
  }
  
  return [
    { 
      source: 'Reactive Power',
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.reactivePower`
      }
    },
    {
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.powerFactor`
      },
      value: (n2k, state) => {
      const val = n2k.fields['Power Factor']
        set(state, `maretron.${prefix(n2k, state)}.powerFactor`, val)
        return val / 32768
      },
      filter: (n2k) => {
        return n2k.fields['Power Factor'] != null
      }
    },
    {
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.powerFactorLogging`
      },
      value: (n2k) => {
        return n2k.fields['Power Factor Lagging'].toLowerCase()
      },
      filter: (n2k) => {
        return n2k.fields['Power Factor Lagging'] != null
      }
    },
  ]
}
