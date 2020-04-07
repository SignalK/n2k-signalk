
module.exports = (type, phase) => {
  function prefix(n2k, state) {
    return `electrical.${type}.${state.deviceInstance || 0}.${phase}`
  }

  return [
    {
      source: 'Line-Line AC RMS Voltage',
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.lineLineVoltage`
      },
      filter: (n2k, state) => {
        return state.deviceInstance != null
      }
    },
    {
      source: 'Line-Neutral AC RMS Voltage',
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.lineNeutralVoltage`
      },
      filter: (n2k, state) => {
        return state.deviceInstance != null
      }
    },
    {
      source: 'AC Frequency',
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.frequency`
      },
      filter: (n2k, state) => {
        return state.deviceInstance != null
      }
    },
    {
      source: 'AC RMS Current',
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.current`
      },
      filter: (n2k, state) => {
        return state.deviceInstance != null
      }
    }
  ]
}
