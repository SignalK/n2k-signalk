const util = require('util')
const {
  chooseField,
  skEngineId,
  skEngineTitle,
  timeToSeconds
} = require('../utils.js')

module.exports = [
  {
    source: 'temperature',
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.temperature'
    }
  },
  {
    source: 'alternatorPotential',
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.alternatorVoltage'
    }
  },
  {
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.fuel.rate'
    },
    value: function (n2k) {
      var lph = Number(n2k.fields.fuelRate)
      return isNaN(lph) ? null : lph / 3600000
    }
  },
  {
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.oilPressure'
    },
    value: function (n2k) {
      var kpa = Number(n2k.fields.oilPressure)
      return isNaN(kpa) ? null : kpa
    }
  },
  {
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.runTime'
    },
    value: function (n2k) {
      return timeToSeconds(n2k.fields.totalEngineHours)
    }
  },
  {
    source: 'oilTemperature',
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.oilTemperature'
    }
  },
  {
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.coolantPressure'
    },
    value: function (n2k) {
      var kpa = Number(n2k.fields.coolantPressure)
      return isNaN(kpa) ? null : kpa * 1000.0
    }
  },
  {
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.engineLoad'
    },
    value: function (n2k) {
      var percent = Number(n2k.fields.engineLoad)
      return isNaN(percent) ? null : percent / 100.0
    }
  },
  {
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.engineTorque'
    },
    value: function (n2k) {
      var percent = Number(n2k.fields.engineTorque)
      return isNaN(percent) ? null : percent / 100.0
    }
  },
  {
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.fuel.pressure'
    },
    value: function (n2k) {
      var kpa = Number(n2k.fields.fuelPressure)
      return isNaN(kpa) ? null : kpa * 1000.0
    }
  }
]

var status1Notifications = [
  {
    node: 'notifications.propulsion.%s.checkEngine',
    message: 'Check %s Engine',
    analyzerText: 'Check Engine'
  },
  {
    node: 'notifications.propulsion.%s.overTemperature',
    message: '%s Engine Over Temperature',
    analyzerText: 'Over Temperature'
  },
  {
    node: 'notifications.propulsion.%s.lowOilPressure',
    message: '%s Engine Low Oil Pressure',
    analyzerText: 'Low Oil Pressure'
  },
  {
    node: 'notifications.propulsion.%s.lowOilLevel',
    message: '%s Engine Low Oil Level',
    analyzerText: 'Low Oil Level'
  },
  {
    node: 'notifications.propulsion.%s.lowFuelPressure',
    message: '%s Engine Low Fuel Pressure',
    analyzerText: 'Low Fuel Pressure'
  },
  {
    node: 'notifications.propulsion.%s.lowSystemVoltage',
    message: '%s Low System Voltage',
    analyzerText: 'Low System Voltage'
  },
  {
    node: 'notifications.propulsion.%s.lowCoolantLevel',
    message: '%s Engine Low Coolant Level',
    analyzerText: 'Low Coolant Level'
  },
  {
    node: 'notifications.propulsion.%s.waterFlow',
    message: '%s Engine Water Flow',
    analyzerText: 'Water Flow'
  },
  {
    node: 'notifications.propulsion.%s.waterInFuel',
    message: '%s Water in Fuel',
    analyzerText: 'Water In Fuel'
  },
  {
    node: 'notifications.propulsion.%s.chargeIndicator',
    message: '%s Engine Charge Indicator',
    analyzerText: 'Charge Indicator'
  },
  {
    node: 'notifications.propulsion.%s.preheatIndicator',
    message: '%s Preheat Indicator',
    analyzerText: 'Preheat Indicator'
  },
  {
    node: 'notifications.propulsion.%s.highBoostPressure',
    message: '%s Engine High Boost Pressure',
    analyzerText: 'High Boost Pressure'
  },
  {
    node: 'notifications.propulsion.%s.revLimitExceeded',
    message: '%s Engine Rev Limit Exceeded',
    analyzerText: 'Rev Limit Exceeded'
  },
  {
    node: 'notifications.propulsion.%s.eGRSystem',
    message: '%s Engine EGR System',
    analyzerText: 'EGR System'
  },
  {
    node: 'notifications.propulsion.%s.throttlePositionSensor',
    message: '%s Engine Throttle Position Sensor',
    analyzerText: 'Throttle Position Sensor'
  },
  {
    node: 'notifications.propulsion.%s.emergencyStopMode',
    message: '%s Engine Emergency Stop Mode',
    analyzerText: 'Emergency Stop'
  }
]

var status2Notifications = [
  {
    node: 'notifications.propulsion.%s.warningLevel1',
    message: '%s Engine Warning Level 1',
    analyzerText: 'Warning Level 1'
  },
  {
    node: 'notifications.propulsion.%s.warningLevel2',
    message: '%s Engine Warning Level 2',
    analyzerText: 'Warning Level 2'
  },
  {
    node: 'notifications.propulsion.%s.powerReduction',
    message: '%s Engine Power Reduction',
    analyzerText: 'Power Reduction'
  },
  {
    node: 'notifications.propulsion.%s.maintenanceNeeded',
    message: '%s Engine Maintenance Needed',
    analyzerText: 'Maintenance Needed'
  },
  {
    node: 'notifications.propulsion.%s.commError',
    message: '%s Engine Comm Error',
    analyzerText: 'Engine Comm Error'
  },
  {
    node: 'notifications.propulsion.%s.subOrSecondaryThrottle',
    message: '%s Engine Sub or Secondary Throttle',
    analyzerText: 'Sub or Secondary Throttle'
  },
  {
    node: 'notifications.propulsion.%s.neutralStartProtect',
    message: '%s Neutral Start Protect',
    analyzerText: 'Neutral Start Protect'
  },
  {
    node: 'notifications.propulsion.%s.shuttingDown',
    message: '%s Engine Shutting Down',
    analyzerText: 'Engine Shutting Down'
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
        if (n2k.fields[field].indexOf(notif.analyzerText) != -1) {
          return {
            state: 'alarm',
            method: ['visual', 'sound'],
            message: util.format(notif.message, skEngineTitle(n2k))
          }
        } else {
          return {
            state: 'normal',
            method: [],
            message:
              util.format(notif.message, skEngineTitle(n2k)) + ' is Normal'
          }
        }
      }
    }
    module.exports.push(mapping)
  })
}

generateMappingsForStatus('discreteStatus1', status1Notifications)
generateMappingsForStatus('discreteStatus2', status2Notifications)
