const { instancePrefix } = require('../instanceGroups')

module.exports = [
  {
    node: instancePrefix,
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
