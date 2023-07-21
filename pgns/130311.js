const temperatureMappings = require('../temperatureMappings')

module.exports = [
  {
    node: function (n2k) {
      var temperatureMapping =
        temperatureMappings[n2k.fields['Temperature Source']]

      if (temperatureMapping) {
        if (temperatureMapping.pathWithIndex) {
          return temperatureMapping.pathWithIndex.replace('<index>', 'default')
        } else if (temperatureMapping.path) {
          return temperatureMapping.path
        }
      }
    },
    source: 'Temperature'
  },
  {
    node: function (n2k) {
      return (
        'environment.' +
        (n2k.fields['Humidity Source'] === 'Inside'
          ? 'inside.relativeHumidity'
          : 'outside.humidity')
      )
    },
    filter: function (n2k) {
      return typeof n2k.fields['Humidity'] !== 'undefined'
    },
    value: function (n2k) {
      var ratio100 = Number(n2k.fields['Humidity'])
      return ratio100 / 100
    }
  },
  {
    node: 'environment.outside.pressure',
    filter: function (n2k) {
      return n2k.fields['Atmospheric Pressure']
    },
    value: function (n2k) {
      return Number(n2k.fields['Atmospheric Pressure'])
    }
  }
]
