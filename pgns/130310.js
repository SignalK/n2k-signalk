
module.exports = [
  {
    source: 'Outside Ambient Air Temperature',
    node: 'environment.outside.temperature',
    filter: function(n2k) {
      return n2k.fields['Outside Ambient Air Temperature']
    }
  }, {
    node: 'environment.outside.pressure',
    filter: function(n2k) {
      return n2k.fields['Atmospheric Pressure']
    },
    value: function(n2k) {
      var hpa = Number(n2k.fields['Atmospheric Pressure'])
      return hpa * 100.0;
    }
  }
]
