module.exports = [
  {
    node: 'electrical.ac.utility.rmsVoltage.lineLine',
    value: function (n2k) {
      return n2k.fields['Line-Line AC RMS Voltage']
    },
  },
  {
    node: 'electrical.ac.utility.rmsVoltage.lineNeutral',
    value: function (n2k) {
      return n2k.fields['Line-Neutral AC RMS Voltage']
    },
  },
  {
    node: 'electrical.ac.utility.rmsVoltage.current',
    value: function (n2k) {
      return n2k.fields['AC RMS Current']
    },
  },
  {
    node: 'electrical.ac.utility.frequency',
    value: function (n2k) {
      return n2k.fields['AC Frequency']
    },
  },
]
