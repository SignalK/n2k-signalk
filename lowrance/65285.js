const temperatureMappings = require('../temperatureMappings')

module.exports = [
  {
    source: 'Actual Temperature',
    node: function (n2k) {
      var temperatureMapping =
        temperatureMappings[n2k.fields['Temperature Source']]

      if (temperatureMappings) {
        if (temperatureMapping.pathWithIndex) {
          return temperatureMapping.pathWithIndex.replace('<index>', 'default')
        } else if (temperatureMapping.path) {
          return temperatureMapping.path
        }
      }
    },
    instance: function (n2k) {
      return n2k.fields['Temperature Instance'] + ''
    },
    filter: function (n2k) {
      return n2k.fields['Actual Temperature']
    }
  }
]
