const temperatureMappings = require('../temperatureMappings')
const {chooseField} = require('../utils.js')

module.exports = [
  {
    node: function (n2k) {
      var temperatureMapping =
          temperatureMappings[chooseField(n2k, 'Temperature Source', 'Source')]
      if (temperatureMapping) {
        return temperatureMapping.path
      }
    },
    instance: function (n2k) {
      return chooseField(n2k, 'Temperature Instance', 'Instance') + ''
    },
    source: 'Actual Temperature'
  }
]
