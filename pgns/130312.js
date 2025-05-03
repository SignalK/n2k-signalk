const temperatureMappings = require('../temperatureMappings')

module.exports = [
  {
    node: function (n2k) {
      var temperatureMapping =
        temperatureMappings[n2k.fields.source]
      if (temperatureMapping) {
        if (temperatureMapping.pathWithIndex) {
          return temperatureMapping.pathWithIndex.replace(
            '<index>',
            n2k.fields.instance
          )
        } else if (temperatureMapping.path) {
          return temperatureMapping.path
        }
      } else {
        return `generic.temperatures.userDefined${n2k.fields.source
          .toString()
          .replace(/\ /g, '_')}.${n2k.fields.instance}.temperature`
      }
    },
    instance: function (n2k) {
      return n2k.fields.instance + ''
    },
    source: 'actualTemperature'
  }
]
