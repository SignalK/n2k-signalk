const temperatureMappings = require('../temperatureMappings')

module.exports = [
  {
    node: function (n2k) {
      var temperatureMapping =
        temperatureMappings[n2k.fields['Temperature Source']]
      if (temperatureMapping) {
        return temperatureMapping.path
      }
    },
    source: 'Temperature'
  },
  {
    node: function (n2k) {
      return (
        'environment.' +
        (n2k.fields['Humidity Source'] === 'Inside' ? 'inside' : 'outside') +
        '.humidity'
      )
    },
    source: 'Humidity'
  },
  {
    node: 'environment.outside.pressure',
    filter: function (n2k) {
      return n2k.fields['Atmospheric Pressure']
    },
    value: function (n2k) {
      var hpa = Number(n2k.fields['Atmospheric Pressure'])
      return hpa * 100.0
    }
  }
]
