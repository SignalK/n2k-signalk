const temperatureMappings = require('../temperatureMappings')

module.exports = [
  {
    node: function (n2k) {
      if (n2k.fields.source == null) {
        return null
      }
      var temperatureMapping = temperatureMappings[n2k.fields.source]
      if (temperatureMapping) {
        if (temperatureMapping.pathWithIndex) {
          return temperatureMapping.pathWithIndex.replace(
            '<index>',
            n2k.fields.instance != null ? n2k.fields.instance : 0
          )
        } else if (temperatureMapping.path) {
          return temperatureMapping.path
        }
      } else {
        return `generic.temperatures.userDefined${n2k.fields.source
          .toString()
          .replace(/\ /g, '_')}.${
          n2k.fields.instance != null ? n2k.fields.instance : 0
        }.temperature`
      }
    },
    instance: function (n2k) {
      return n2k.fields.instance != null ? n2k.fields.instance + '' : null
    },
    source: 'actualTemperature'
  }
]
