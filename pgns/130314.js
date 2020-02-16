const pressureMappings = require('../pressureMappings')
const { chooseField } = require('../utils.js')

module.exports = [
  {
    node: function (n2k) {
      var pressureMapping =
        pressureMappings[chooseField(n2k, 'Pressure Source', 'Source')]
      if (pressureMapping) {
        if (pressureMapping.pathWithIndex) {
          return pressureMapping.pathWithIndex.replace(
            '<index>',
            n2k.fields['Instance']
          )
        } else if (pressureMapping.path) {
          return pressureMapping.path
        }
      }
    },
    instance: function (n2k) {
      return chooseField(n2k, 'Pressure Instance', 'Instance') + ''
    },
    source: 'Pressure'
  }
]
