
module.exports = (type, phase) => {
  function prefix(n2k) {
    return `electrical.${type}.0.${phase}`
  }

  return [
    {
      source: 'Line-Line AC RMS Voltage',
      node: function (n2k) {
        return `${prefix(n2k)}.lineLineVoltage`
      }
    },
    {
      source: 'Line-Neutral AC RMS Voltage',
      node: function (n2k) {
        return `${prefix(n2k)}.lineNeutralVoltage`
      }
    },
    {
      source: 'AC Frequency',
    node: function (n2k) {
      return `${prefix(n2k)}.frequency`
    }
    },
    {
      source: 'AC RMS Current',
      node: function (n2k) {
        return `${prefix(n2k)}.current`
      }
    }
  ]
}
