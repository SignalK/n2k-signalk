const { chooseField } = require('../utils.js')
const { instancePrefix } = require('../instanceGroups')

module.exports = [
  {
    node: function (n2k, state) {
      return instancePrefix(n2k, state) + '.revolutions'
    },
    value: function (n2k) {
      var rpm = Number(n2k.fields.speed)
      return rpm / 60.0
    }
  },
  {
    node: function (n2k, state) {
      return instancePrefix(n2k, state) + '.drive.trimState'
    },
    value: function (n2k) {
      var trimPos = Number(n2k.fields.tiltTrim)

      if (trimPos > 0) {
        trimPos = trimPos / 100
      }

      return trimPos
    },
    filter: function (n2k) {
      return typeof n2k.fields.tiltTrim !== 'undefined'
    }
  },
  {
    node: function (n2k, state) {
      return instancePrefix(n2k, state) + '.boostPressure'
    },
    source: 'boostPressure'
  }
]
