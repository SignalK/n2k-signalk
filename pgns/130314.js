const pressureMappings = require('../pressureMappings')

module.exports = [
  {
    node: function (n2k) {
      if (n2k.fields.source == null) {
        return null
      }
      var instance = n2k.fields.instance != null ? n2k.fields.instance : 0
      var pressureMapping = pressureMappings[n2k.fields.source]
      if (pressureMapping) {
        if (pressureMapping.pathWithIndex) {
          return pressureMapping.pathWithIndex.replace('<index>', instance)
        } else if (pressureMapping.path) {
          return pressureMapping.path
        }
      }
      // A source the PRESSURE_SOURCE lookup does not name arrives as its
      // number; give it a path of its own, as 130312 does for temperatures.
      return `generic.pressures.userDefined${n2k.fields.source
        .toString()
        .replace(/\ /g, '_')}.${instance}.pressure`
    },
    instance: function (n2k) {
      return n2k.fields.instance + ''
    },
    source: 'pressure'
  }
]
