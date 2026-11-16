type State = { deviceInstance?: number }

module.exports = (type: string, phase: string) => {
  function prefix(n2k: unknown, state: State) {
    return `electrical.${type}.${state.deviceInstance || 0}.${phase}`
  }

  return [
    {
      source: 'lineLineAcRmsVoltage',
      node: function (n2k: unknown, state: State) {
        return `${prefix(n2k, state)}.lineLineVoltage`
      },
      filter: (n2k: unknown, state: State) => {
        return state.deviceInstance != null
      }
    },
    {
      source: 'lineNeutralAcRmsVoltage',
      node: function (n2k: unknown, state: State) {
        return `${prefix(n2k, state)}.lineNeutralVoltage`
      },
      filter: (n2k: unknown, state: State) => {
        return state.deviceInstance != null
      }
    },
    {
      source: 'acFrequency',
      node: function (n2k: unknown, state: State) {
        return `${prefix(n2k, state)}.frequency`
      },
      filter: (n2k: unknown, state: State) => {
        return state.deviceInstance != null
      }
    },
    {
      source: 'acRmsCurrent',
      node: function (n2k: unknown, state: State) {
        return `${prefix(n2k, state)}.current`
      },
      filter: (n2k: unknown, state: State) => {
        return state.deviceInstance != null
      }
    }
  ]
}
