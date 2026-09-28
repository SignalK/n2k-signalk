import { PGN_127489 } from '@canboat/ts-pgns'
import { format } from 'util'
const { instancePrefix, engineTitle } = require('../instanceGroups')

// canboatjs gives every value in SI (Pa, m3/s, K, V, ratios, seconds), as
// Signal K wants them, so each is passed on as it is.
const engine = (path: string) => (n2k: PGN_127489, state: any) =>
  `${instancePrefix(n2k, state)}.${path}`

const mappings: any[] = [
  { source: 'temperature', node: engine('temperature') },
  { source: 'alternatorPotential', node: engine('alternatorVoltage') },
  { source: 'fuelRate', node: engine('fuel.rate') },
  { source: 'oilPressure', node: engine('oilPressure') },
  { source: 'totalEngineHours', node: engine('runTime') },
  { source: 'oilTemperature', node: engine('oilTemperature') },
  { source: 'coolantPressure', node: engine('coolantPressure') },
  { source: 'engineLoad', node: engine('engineLoad') },
  { source: 'engineTorque', node: engine('engineTorque') },
  { source: 'fuelPressure', node: engine('fuel.pressure') }
]

type Notification = { node: string; message: string; analyzerText: string }

const status1Notifications: Notification[] = [
  {
    node: 'notifications.%s.checkEngine',
    message: 'Check %s Engine',
    analyzerText: 'Check Engine'
  },
  {
    node: 'notifications.%s.overTemperature',
    message: '%s Engine Over Temperature',
    analyzerText: 'Over Temperature'
  },
  {
    node: 'notifications.%s.lowOilPressure',
    message: '%s Engine Low Oil Pressure',
    analyzerText: 'Low Oil Pressure'
  },
  {
    node: 'notifications.%s.lowOilLevel',
    message: '%s Engine Low Oil Level',
    analyzerText: 'Low Oil Level'
  },
  {
    node: 'notifications.%s.lowFuelPressure',
    message: '%s Engine Low Fuel Pressure',
    analyzerText: 'Low Fuel Pressure'
  },
  {
    node: 'notifications.%s.lowSystemVoltage',
    message: '%s Low System Voltage',
    analyzerText: 'Low System Voltage'
  },
  {
    node: 'notifications.%s.lowCoolantLevel',
    message: '%s Engine Low Coolant Level',
    analyzerText: 'Low Coolant Level'
  },
  {
    node: 'notifications.%s.waterFlow',
    message: '%s Engine Water Flow',
    analyzerText: 'Water Flow'
  },
  {
    node: 'notifications.%s.waterInFuel',
    message: '%s Water in Fuel',
    analyzerText: 'Water In Fuel'
  },
  {
    node: 'notifications.%s.chargeIndicator',
    message: '%s Engine Charge Indicator',
    analyzerText: 'Charge Indicator'
  },
  {
    node: 'notifications.%s.preheatIndicator',
    message: '%s Preheat Indicator',
    analyzerText: 'Preheat Indicator'
  },
  {
    node: 'notifications.%s.highBoostPressure',
    message: '%s Engine High Boost Pressure',
    analyzerText: 'High Boost Pressure'
  },
  {
    node: 'notifications.%s.revLimitExceeded',
    message: '%s Engine Rev Limit Exceeded',
    analyzerText: 'Rev Limit Exceeded'
  },
  {
    node: 'notifications.%s.eGRSystem',
    message: '%s Engine EGR System',
    analyzerText: 'EGR System'
  },
  {
    node: 'notifications.%s.throttlePositionSensor',
    message: '%s Engine Throttle Position Sensor',
    analyzerText: 'Throttle Position Sensor'
  },
  {
    node: 'notifications.%s.emergencyStopMode',
    message: '%s Engine Emergency Stop Mode',
    analyzerText: 'Emergency Stop'
  }
]

const status2Notifications: Notification[] = [
  {
    node: 'notifications.%s.warningLevel1',
    message: '%s Engine Warning Level 1',
    analyzerText: 'Warning Level 1'
  },
  {
    node: 'notifications.%s.warningLevel2',
    message: '%s Engine Warning Level 2',
    analyzerText: 'Warning Level 2'
  },
  {
    node: 'notifications.%s.powerReduction',
    message: '%s Engine Power Reduction',
    analyzerText: 'Power Reduction'
  },
  {
    node: 'notifications.%s.maintenanceNeeded',
    message: '%s Engine Maintenance Needed',
    analyzerText: 'Maintenance Needed'
  },
  {
    node: 'notifications.%s.commError',
    message: '%s Engine Comm Error',
    analyzerText: 'Engine Comm Error'
  },
  {
    node: 'notifications.%s.subOrSecondaryThrottle',
    message: '%s Engine Sub or Secondary Throttle',
    analyzerText: 'Sub or Secondary Throttle'
  },
  {
    node: 'notifications.%s.neutralStartProtect',
    message: '%s Neutral Start Protect',
    analyzerText: 'Neutral Start Protect'
  },
  {
    node: 'notifications.%s.shuttingDown',
    message: '%s Engine Shutting Down',
    analyzerText: 'Engine Shutting Down'
  }
]

function generateMappingsForStatus(
  field: string,
  notifications: Notification[]
) {
  notifications.forEach((notif) => {
    mappings.push({
      node: (n2k: PGN_127489, state: any) =>
        format(notif.node, instancePrefix(n2k, state)),
      // A decoded status is the list of the bits set; anything else (absent
      // or not available) says nothing about this notification.
      filter: (n2k: PGN_127489) => Array.isArray((n2k.fields as any)[field]),
      value: (n2k: PGN_127489, state: any) => {
        const message = format(notif.message, engineTitle(n2k, state))
        if ((n2k.fields as any)[field].indexOf(notif.analyzerText) != -1) {
          return { state: 'alarm', method: ['visual', 'sound'], message }
        }
        return { state: 'normal', method: [], message: message + ' is Normal' }
      }
    })
  })
}

generateMappingsForStatus('discreteStatus1', status1Notifications)
generateMappingsForStatus('discreteStatus2', status2Notifications)

module.exports = mappings
