module.exports = [
  {
    node: 'electrical.ac.generator.rmsVoltage.lineLine',
    value: function (n2k) {
      return n2k.fields['Line-Line AC RMS Voltage']
    },
  },
  {
    node: 'electrical.ac.generator.rmsVoltage.lineNeutral',
    value: function (n2k) {
      return n2k.fields['Line-Neutral AC RMS Voltage']
    },
  },
  {
    node: 'electrical.ac.generator.rmsVoltage.current',
    value: function (n2k) {
      return n2k.fields['AC RMS Current']
    },
  },
  {
    node: 'electrical.ac.generator.frequency',
    value: function (n2k) {
      return n2k.fields['AC Frequency']
    },
  },
]
