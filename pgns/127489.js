const util = require('util')

module.exports = [
  {
    source: 'Temperature',
    node: 'propulsion.port.temperature',
    filter: function (n2k) {
      return (
        n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port'
      )
    }
  },
  {
    source: 'Temperature',
    node: 'propulsion.starboard.temperature',
    filter: function (n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard'
    }
  },
  {
    source: 'Alternator Potential',
    node: 'propulsion.port.alternatorVoltage',
    filter: function (n2k) {
      return (
        n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port'
      )
    }
  },
  {
    source: 'Alternator Potential',
    node: 'propulsion.starboard.alternatorVoltage',
    filter: function (n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard'
    }
  },
  {
    node: 'propulsion.port.fuel.rate',
    filter: function (n2k) {
      return (
        n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port'
      )
    },
    value: function (n2k) {
      var lph = Number(n2k.fields['Fuel Rate'])
      return lph / 3600000
    }
  },
  {
    node: 'propulsion.starboard.fuel.rate',
    filter: function (n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard'
    },
    value: function (n2k) {
      var lph = Number(n2k.fields['Fuel Rate'])
      return lph / 3600000
    }
  },
  {
    node: 'propulsion.port.oilPressure',
    filter: function (n2k) {
      return (
        n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port'
      )
    },
    value: function (n2k) {
      var kpa = Number(n2k.fields['Oil pressure'])
      return kpa * 1000.0
    }
  },
  {
    node: 'propulsion.starboard.oilPressure',
    filter: function (n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard'
    },
    value: function (n2k) {
      var kpa = Number(n2k.fields['Oil pressure'])
      return kpa * 1000.0
    }
  },
  {
    source: 'Total Engine hours',
    node: 'propulsion.port.runTime',
    filter: function (n2k) {
      return (
        n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port'
      )
    }
  },
  {
    source: 'Total Engine hours',
    node: 'propulsion.starboard.runTime',
    filter: function (n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard'
    }
  },
  {
    node: 'propulsion.port.engineLoad',
    filter: function (n2k) {
      return (
        n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port'
      )
    },
    value: function (n2k) {
      var percent = Number(n2k.fields['Percent Engine Load'])
      return percent / 100.0
    }
  },
  {
    node: 'propulsion.port.engineTorque',
    filter: function (n2k) {
      return (
        n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port'
      )
    },
    value: function (n2k) {
      var percent = Number(n2k.fields['Percent Engine Torque'])
      return percent / 100.0
    }
  },
  {
    node: 'propulsion.starboard.engineLoad',
    filter: function (n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard'
    },
    value: function (n2k) {
      var percent = Number(n2k.fields['Percent Engine Load'])
      return percent / 100.0
    }
  },
  {
    node: 'propulsion.starboard.engineTorque',
    filter: function (n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard'
    },
    value: function (n2k) {
      var percent = Number(n2k.fields['Percent Engine Torque'])
      return percent / 100.0
    }
  }
]

var status1Notifications = [
  {
    node: 'notifications.propulsion.%s.checkEngine',
    message: 'Check %s Engine'
  },
  {
    node: 'notifications.propulsion.%s.overTemperature',
    message: '%s Engine Over Temperature'
  },
  {
    node: 'notifications.propulsion.%s.lowOilPressure',
    message: '%s Engine Low Oil Pressure'
  },
  {
    node: 'notifications.propulsion.%s.lowOilLevel',
    message: '%s Engine Low Oil Level'
  },
  {
    node: 'notifications.propulsion.%s.lowFuelPressure',
    message: '%s Engine Low Fuel Pressure'
  },
  {
    node: 'notifications.propulsion.%s.lowSystemVoltage',
    message: '%s Low System Voltage'
  },
  {
    node: 'notifications.propulsion.%s.lowCoolantLevel',
    message: '%s Engine Low Coolant Level'
  },
  {
    node: 'notifications.propulsion.%s.waterFlow',
    message: '%s Engine Water Flow'
  },
  {
    node: 'notifications.propulsion.%s.waterInFuel',
    message: '%s Water in Fuel'
  },
  {
    node: 'notifications.propulsion.%s.chargeIndicator',
    message: '%s Engine Charge Indicator'
  },
  {
    node: 'notifications.propulsion.%s.preheatIndicator',
    message: '%s Preheat Indicator'
  },
  {
    node: 'notifications.propulsion.%s.highBoostPressure',
    message: '%s Engine High Boost Pressure'
  },
  {
    node: 'notifications.propulsion.%s.revLimitExceeded',
    message: '%s Engine Rev Limit Exceeded'
  },
  {
    node: 'notifications.propulsion.%s.eGRSystem',
    message: '%s Engine EGR System'
  },
  {
    node: 'notifications.propulsion.%s.throttlePositionSensor',
    message: '%s Engine Throttle Position Sensor'
  },
  {
    node: 'notifications.propulsion.%s.emergencyStopMode',
    message: '%s Engine Emergency Stop Mode'
  }
];

var status2Notifications = [
  { 
    node: 'notifications.propulsion.%s.warningLevel1',
    message: '%s Engine Warning Level 1'
  },
  {
    node: 'notifications.propulsion.%s.warningLevel2',
    message: '%s Engine Warning Level 2'
  },
  {
    node: 'notifications.propulsion.%s.powerReduction',
    message: '%s Engine Power Reduction'
  },
  {
    node: 'notifications.propulsion.%s.maintenanceNeeded',
    message: '%s Engine Maintenance Needed'
  },
  {
    node: 'notifications.propulsion.%s.commError',
    message: '%s Engine Comm Error'
  },
  {
    node: 'notifications.propulsion.%s.subOrSecondaryThrottle',
    message: '%s Engine Sub or Secondary Throttle'
  },
  {
    node: 'notifications.propulsion.%s.neutralStartProtect',
    message: '%s Neutral Start Protect'
  },
  {
    node: 'notifications.propulsion.%s.shuttingDown',
    message: '%s Engine Shutting Down'
  }
];


function generateMappingsForStatus(field, notifications)
{
  notifications.forEach((notif,index) => {
    var mapping = {
      node: function(n2k) {
        var engine = n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port' ? "port" : "starboard";
        return util.format(notif.node, engine);
      },
      filter: function(n2k) { return typeof n2k.fields[field] !== 'undefined'; },
      value: function(n2k, state) {
        var engine = n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port' ? "Port" : "Starboard";
        
        if ( n2k.fields[field] != 0 ) {
          if ( n2k.fields[field] & (1<<index) ) {
            if ( typeof state === 'undefined'
                 || typeof state[notif.node] === 'undefined'
                 || state[notif.node] != 'alarm') {
              if ( typeof state !== 'undefined' )
                state[notif.node] = 'alarm'
              return {
                state: 'alarm',
                method: [ "visual", "sound" ],
                message: util.format(notif.message, engine)
              }
            } else {
              return null
            }
          }
        } else if ( typeof state !== 'undefined'
                    && typeof state[notif.node] !== 'undefined'
                    && state[notif.node] == 'alarm') {
          state[notif.node] = 'normal'
          return {
            state: 'normal',
            method: [ "visual" ],
            message: util.format(notif.message, engine) + ' is Normal'
          }
        } else {
          return null;
        }
      }
    }
    module.exports.push(mapping);
  });
}

generateMappingsForStatus('Discrete Status 1', status1Notifications);
generateMappingsForStatus('Discrete Status 2', status2Notifications);

