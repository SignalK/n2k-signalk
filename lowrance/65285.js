const temperatureMappings = require('../temperatureMappings')

module.exports = [
  {
    source: 'actualTemperature',
    node: function (n2k) {
      var temperatureMapping = temperatureMappings[n2k.fields.temperatureSource]

      if (temperatureMapping) {
        if (temperatureMapping.pathWithIndex) {
          // Lowrance 65285 includes a Temperature Instance field, but
          // not every emitter populates it. Fall back to the literal
          // 'default' so downstream paths stay valid against the
          // Signal K schema (tanks.liveWell.<id>.temperature etc.).
          var instance =
            n2k.fields.temperatureInstance !== undefined
              ? n2k.fields.temperatureInstance
              : 'default'
          return temperatureMapping.pathWithIndex.replace('<index>', instance)
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
