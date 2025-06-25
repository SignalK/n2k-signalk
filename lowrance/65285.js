const temperatureMappings = require('../temperatureMappings')

module.exports = [
  {
    source: 'actualTemperature',
    node: function (n2k) {
      var temperatureMapping = temperatureMappings[n2k.fields.temperatureSource]

      if (temperatureMappings) {
        if (temperatureMapping.pathWithIndex) {
          return temperatureMapping.pathWithIndex.replace('<index>', 'default')
        } else if (temperatureMapping.path) {
          return temperatureMapping.path
        }
      }
    },
    instance: function (n2k) {
      return n2k.fields.temperatureInstance + ''
    },
    filter: function (n2k) {
      return n2k.fields.actualTemperature
    }
  }
]
