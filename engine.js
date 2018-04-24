const util = require('util')

var skEngineId = function (n2k) {
  return n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port' ? 'port' : 'starboard'
}

var skEngineTitle = function (n2k) {
  var engine = skEngineId(n2k)
  return engine.charAt(0).toUpperCase() + engine.slice(1)
}

exports.generateMappingsForStatus = function (field, notifications) {
  var mappings = []

  notifications.forEach((notif, index) => {
    var mapping = {
      node: function (n2k) {
        return util.format(notif.node, skEngineId(n2k))
      },
      filter: function (n2k) { return typeof n2k.fields[field] !== 'undefined' },
      value: function (n2k, state) {
        if (n2k.fields[field].indexOf(notif.analyzerText) != -1) {
          return {
            state: 'alarm',
            method: [ 'visual', 'sound' ],
            message: util.format(notif.message, skEngineTitle(n2k))
          }
        } else {
          return {
            state: 'normal',
            method: [ 'visual' ],
            message: util.format(notif.message, skEngineTitle(n2k)) + ' is Normal'
          }
        }
      }
    }
    mappings.push(mapping)
  })

  return mappings
}

exports.skEngineId = skEngineId
exports.skEngineTitle = skEngineTitle
