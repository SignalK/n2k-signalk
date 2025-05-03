
module.exports = (type, phase) => {
  function prefix(n2k, state) {
    return `electrical.${type}.${state.deviceInstance || 0}.${phase}`
  }

  return [
    {
      source: 'lineLineAcRmsVoltage',
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.lineLineVoltage`
      },
      filter: (n2k, state) => {
        return state.deviceInstance != null
      }
    },
    {
      source: 'lineNeutralAcRmsVoltage',
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.lineNeutralVoltage`
      },
      filter: (n2k, state) => {
        return state.deviceInstance != null
      }
    },
    {
      source: 'acFrequency',
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.frequency`
      },
      filter: (n2k, state) => {
        return state.deviceInstance != null
      }
    },
    {
      source: 'acRmsCurrent',
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.current`
      },
      filter: (n2k, state) => {
        return state.deviceInstance != null
      }
    }
  ]
}
