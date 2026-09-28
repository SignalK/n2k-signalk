const { instancePrefix } = require('../instanceGroups')

module.exports = [
  {
    node: instancePrefix,
    instance: function (n2k) {
      return n2k.fields.instance != null ? n2k.fields.instance + '' : null
    },
    source: 'actualTemperature'
  }
]
