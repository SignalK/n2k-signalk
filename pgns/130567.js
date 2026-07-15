const util = require('util')
const { timeToSeconds } = require('../utils.js')

// PGN 130567 carries no instance field, so all values map to instance 0.
const wmId = () => 0

function yesNo (n2k, field) {
  const v = n2k.fields[field]
  return typeof v === 'undefined' ? null : v === 'Yes'
}

function flowToCubicMetersPerSecond (n2k, field) {
  const lph = Number(n2k.fields[field])
  return isNaN(lph) ? null : lph / 3600000
}

module.exports = [
  {
    source: 'watermakerOperatingState',
    node: n2k => `watermaker.${wmId(n2k)}.state`
  },
  {
    node: n2k => `watermaker.${wmId(n2k)}.production`,
    value: n2k => yesNo(n2k, 'productionStartStop')
  },
  {
    node: n2k => `watermaker.${wmId(n2k)}.rinsing`,
    value: n2k => yesNo(n2k, 'rinseStartStop')
  },
  {
    node: n2k => `watermaker.${wmId(n2k)}.lowPressurePump`,
    value: n2k => yesNo(n2k, 'lowPressurePumpStatus')
  },
  {
    node: n2k => `watermaker.${wmId(n2k)}.highPressurePump`,
    value: n2k => yesNo(n2k, 'highPressurePumpStatus')
  },
  {
    node: n2k => `watermaker.${wmId(n2k)}.emergencyStop`,
    value: n2k => yesNo(n2k, 'emergencyStop')
  },
  {
    node: n2k => `watermaker.${wmId(n2k)}.flushMode`,
    value: n2k => yesNo(n2k, 'flushModeStatus')
  },
  {
    // canboat reports ppm, Signal K uses ratio
    node: n2k => `watermaker.${wmId(n2k)}.salinity`,
    value: n2k => {
      const ppm = Number(n2k.fields.salinity)
      return isNaN(ppm) ? null : ppm / 1000000
    }
  },
  {
    source: 'productWaterTemperature',
    node: n2k => `watermaker.${wmId(n2k)}.productWaterTemperature`
  },
  {
    source: 'preFilterPressure',
    node: n2k => `watermaker.${wmId(n2k)}.preFilterPressure`
  },
  {
    source: 'postFilterPressure',
    node: n2k => `watermaker.${wmId(n2k)}.postFilterPressure`
  },
  {
    source: 'feedPressure',
    node: n2k => `watermaker.${wmId(n2k)}.feedPressure`
  },
  {
    source: 'systemHighPressure',
    node: n2k => `watermaker.${wmId(n2k)}.systemHighPressure`
  },
  {
    node: n2k => `watermaker.${wmId(n2k)}.productWaterFlow`,
    value: n2k => flowToCubicMetersPerSecond(n2k, 'productWaterFlow')
  },
  {
    node: n2k => `watermaker.${wmId(n2k)}.brineWaterFlow`,
    value: n2k => flowToCubicMetersPerSecond(n2k, 'brineWaterFlow')
  },
  {
    node: n2k => `watermaker.${wmId(n2k)}.runTime`,
    value: n2k => {
      const t = n2k.fields.runTime
      if (typeof t === 'number') {
        return t
      }
      return timeToSeconds(t)
    }
  }
]

const warningNotifications = [
  {
    field: 'productSolenoidValveStatus',
    name: 'productSolenoidValve',
    message: 'Watermaker Product Solenoid Valve'
  },
  {
    field: 'salinityStatus',
    name: 'salinity',
    message: 'Watermaker Salinity'
  },
  {
    field: 'sensorStatus',
    name: 'sensor',
    message: 'Watermaker Sensor'
  },
  {
    field: 'oilChangeIndicatorStatus',
    name: 'oilChange',
    message: 'Watermaker Oil Change'
  },
  {
    field: 'filterStatus',
    name: 'filter',
    message: 'Watermaker Filter'
  },
  {
    field: 'systemStatus',
    name: 'system',
    message: 'Watermaker System'
  }
]

warningNotifications.forEach(notif => {
  module.exports.push({
    node: function (n2k) {
      return util.format(
        'notifications.watermaker.%s.%s',
        wmId(n2k),
        notif.name
      )
    },
    filter: function (n2k) {
      return typeof n2k.fields[notif.field] !== 'undefined'
    },
    value: function (n2k) {
      if (n2k.fields[notif.field] === 'Warning') {
        return {
          state: 'alert',
          method: ['visual'],
          message: notif.message + ' Warning'
        }
      } else {
        return {
          state: 'normal',
          method: [],
          message: notif.message + ' is Normal'
        }
      }
    }
  })
})

module.exports.push({
  node: function (n2k) {
    return util.format('notifications.watermaker.%s.emergencyStop', wmId(n2k))
  },
  filter: function (n2k) {
    return typeof n2k.fields.emergencyStop !== 'undefined'
  },
  value: function (n2k) {
    if (n2k.fields.emergencyStop === 'Yes') {
      return {
        state: 'emergency',
        method: ['visual', 'sound'],
        message: 'Watermaker Emergency Stop'
      }
    } else {
      return {
        state: 'normal',
        method: [],
        message: 'Watermaker Emergency Stop is Normal'
      }
    }
  }
})
