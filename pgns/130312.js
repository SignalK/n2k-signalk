const temperatureMappings = require('../temperatureMappings')
const {chooseField} = require('../utils.js')

module.exports = [
  {
    node: function (n2k) {
      var temperatureMapping =
          temperatureMappings[chooseField(n2k, 'Temperature Source', 'Source')]
      if (temperatureMapping) {
        if (temperatureMapping.pathWithIndex) {
          return temperatureMapping.pathWithIndex.replace('<index>', n2k.fields['Temperature Instance'])
        }
        else if (temperatureMapping.path) {
          return temperatureMapping.path
        }
      }
    },
    instance: function (n2k) {
      return chooseField(n2k, 'Temperature Instance', 'Instance') + ''
    },
    source: 'Actual Temperature'
  }
]
