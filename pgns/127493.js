const util = require('util')
const { chooseField } = require('../utils.js')
const { instancePrefix, engineTitle } = require('../instanceGroups')

module.exports = [
  {
    source: 'oilTemperature',
    node: function (n2k, state) {
      return instancePrefix(n2k, state) + '.transmission.oilTemperature'
    }
  },
  {
    source: 'transmissionGear',
    node: function (n2k, state) {
      return instancePrefix(n2k, state) + '.transmission.gear'
    }
  },
  {
    node: function (n2k, state) {
      return instancePrefix(n2k, state) + '.transmission.oilPressure'
    },
    value: function (n2k) {
      var kpa = Number(n2k.fields.oilPressure)
      return isNaN(kpa) ? null : kpa
    }
  }
]

var status1Notifications = [
  {
    node: 'notifications.%s.transmission.checkTransmission',
    message: 'Check %s Engine',
    analyzerText: 'Check Transmission'
  },
  {
    node: 'notifications.%s.transmission.overTemperature',
    message: '%s Transmission Over Temperature',
    analyzerText: 'Over Temperature'
  },
  {
    node: 'notifications.%s.transmission.lowOilPressure',
    message: '%s Transmission Low Oil Pressure',
    analyzerText: 'Low Oil Pressure'
  },
  {
    node: 'notifications.%s.transmission.lowOilLevel',
    message: '%s Transmission Low Oil Level',
    analyzerText: 'Low Oil Level'
  },
  {
    node: 'notifications.%s.transmission.sailDrive',
    message: '%s Transmission Sail Drive',
    analyzerText: 'Sail Drive'
  }
]

function generateMappingsForStatus (field, notifications) {
  notifications.forEach((notif, index) => {
    var mapping = {
      node: function (n2k, state) {
        return util.format(notif.node, instancePrefix(n2k, state))
      },
      filter: function (n2k) {
        return typeof n2k.fields[field] !== 'undefined'
      },
      value: function (n2k, state) {
        const val = n2k.fields[field]
        let on = false

        if (typeof val === 'number') {
          on = val & (1 << index)
        } else {
          on = n2k.fields[field].indexOf(notif.analyzerText) != -1
        }

        if (on) {
          return {
            state: 'alarm',
            method: ['visual', 'sound'],
            message: util.format(notif.message, engineTitle(n2k, state))
          }
        } else {
          return {
            state: 'normal',
            method: ['visual'],
            message:
              util.format(notif.message, engineTitle(n2k, state)) + ' is Normal'
          }
        }
      }
    }
    module.exports.push(mapping)
  })
}

generateMappingsForStatus('discreteStatus1', status1Notifications)
