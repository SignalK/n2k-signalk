const util = require('util')
const { chooseField, skEngineId, skEngineTitle } = require('../utils.js')

module.exports = [
  {
    source: 'Oil temperature',
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.transmission.oilTemperature'
    }
  },
  {
    source: 'Transmission Gear',
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.transmission.gear'
    }
  },
  {
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.transmission.oilPressure'
    },
    value: function (n2k) {
      var kpa = Number(n2k.fields['Oil pressure'])
      return isNaN(kpa) ? null : kpa
    }
  }
]

var status1Notifications = [
  {
    node: 'notifications.propulsion.%s.transmission.checkTransmission',
    message: 'Check %s Engine',
    analyzerText: 'Check Transmission'
  },
  {
    node: 'notifications.propulsion.%s.transmission.overTemperature',
    message: '%s Transmission Over Temperature',
    analyzerText: 'Over Temperature'
  },
  {
    node: 'notifications.propulsion.%s.transmission.lowOilPressure',
    message: '%s Transmission Low Oil Pressure',
    analyzerText: 'Low Oil Pressure'
  },
  {
    node: 'notifications.propulsion.%s.transmission.lowOilLevel',
    message: '%s Transmission Low Oil Level',
    analyzerText: 'Low Oil Level'
  },
  {
    node: 'notifications.propulsion.%s.transmission.sailDrive',
    message: '%s Transmission Sail Drive',
    analyzerText: 'Sail Drive'
  }
]

function generateMappingsForStatus (field, notifications) {
  notifications.forEach((notif, index) => {
    var mapping = {
      node: function (n2k) {
        return util.format(notif.node, skEngineId(n2k))
      },
      filter: function (n2k) {
        return typeof n2k.fields[field] !== 'undefined'
      },
      value: function (n2k, state) {
        const val  = n2k.fields[field]
        let on = false

        if ( typeof val === 'number' ) {
          on = val & (1<<index)
        } else {
          on = n2k.fields[field].indexOf(notif.analyzerText) != -1
        }
        
        if (on) {
          return {
            state: 'alarm',
            method: ['visual', 'sound'],
            message: util.format(notif.message, skEngineTitle(n2k))
          }
        } else {
          return {
            state: 'normal',
            method: ['visual'],
            message:
              util.format(notif.message, skEngineTitle(n2k)) + ' is Normal'
          }
        }
      }
    }
    module.exports.push(mapping)
  })
}

generateMappingsForStatus('Discrete Status 1', status1Notifications)
