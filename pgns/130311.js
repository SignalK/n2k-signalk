const temperatureMappings = require('../temperatureMappings')

module.exports = [
  {
    node: function (n2k) {
      var temperatureMapping = temperatureMappings[n2k.fields.temperatureSource]

      if (temperatureMapping) {
        if (temperatureMapping.pathWithIndex) {
          return temperatureMapping.pathWithIndex.replace('<index>', 'default')
        } else if (temperatureMapping.path) {
          return temperatureMapping.path
        }
      }
    },
    filter: function (n2k) {
      return n2k.fields.temperatureSource !== undefined
    },
    source: 'temperature'
  },
  {
    node: function (n2k) {
      return (
        'environment.' +
        (n2k.fields.humiditySource === 'Inside'
          ? 'inside.relativeHumidity'
          : 'outside.humidity')
      )
    },
    filter: function (n2k) {
      return typeof n2k.fields.humidity !== 'undefined'
    },
    value: function (n2k) {
      var ratio100 = Number(n2k.fields.humidity)
      return ratio100 / 100
    }
  },
  {
    node: 'environment.outside.pressure',
    filter: function (n2k) {
      return n2k.fields.atmosphericPressure
    },
    value: function (n2k) {
      return Number(n2k.fields.atmosphericPressure)
    }
  }
]
