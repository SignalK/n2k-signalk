const { instancePrefix } = require('../instanceGroups')

module.exports = [
  {
    node: function (n2k, state) {
      return instancePrefix(n2k, state) + '.currentLevel'
    },
    value: function (n2k) {
      var ratio100 = Number(n2k.fields.level)
      return ratio100 / 100
    }
  },
  {
    node: function (n2k, state) {
      return instancePrefix(n2k, state) + '.capacity'
    },
    value: function (n2k) {
      var value = Number(n2k.fields.capacity)
      return value / 1000
    },
    filter: n2k => {
      return typeof n2k.fields.capacity !== 'undefined'
    }
  }
]
