module.exports = [
  {
    node: 'environment.outside.pressure',
    filter: function (n2k) {
      return n2k.fields['Pressure Source'] == 'Atmospheric'
    },
    value: function (n2k) {
      return Number(n2k.fields['Pressure'])
    }
  }
]
