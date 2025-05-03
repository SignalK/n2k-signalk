const pressureMappings = require('../pressureMappings')

module.exports = [
  {
    node: function (n2k) {
      var pressureMapping =
        pressureMappings[n2k.fields.source]
      if (pressureMapping) {
        if (pressureMapping.pathWithIndex) {
          return pressureMapping.pathWithIndex.replace(
            '<index>',
            n2k.fields.instance
          )
        } else if (pressureMapping.path) {
          return pressureMapping.path
        }
      }
    },
    instance: function (n2k) {
      return n2k.fields.instance + ''
    },
    source: 'pressure'
  }
]
