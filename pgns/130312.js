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
    instance: function (n2k) {
      return n2k.fields['Temperature Instance'] + ''
    },
    source: 'Actual Temperature'
  }
]
