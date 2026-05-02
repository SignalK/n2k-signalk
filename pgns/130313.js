const humidityMappings = require('../humidityMappings')

module.exports = [
  {
    node: function (n2k) {
      const mapping = humidityMappings[n2k.fields.source]
      if (mapping) {
        if (mapping.pathWithIndex) {
          return mapping.pathWithIndex.replace('<index>', n2k.fields.instance)
        }
        if (mapping.path) {
          return mapping.path
        }
      }
      return `environment.userDefined${n2k.fields.source}.${n2k.fields.instance}.relativeHumidity`
    },
    filter: function (n2k) {
      return typeof n2k.fields.actualHumidity !== 'undefined'
    },
    instance: function (n2k) {
      return n2k.fields.instance + ''
    },
    value: function (n2k) {
      var ratio100 = Number(n2k.fields.actualHumidity)
      return ratio100 / 100
    }
  }
]
