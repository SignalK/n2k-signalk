import { PGN_127489 } from '@canboat/ts-pgns'
import { format } from 'util'
import { skEngineId, skEngineTitle } from '../utils.js'

// canboatjs gives every value in SI (Pa, m3/s, K, V, ratios, seconds), as
// Signal K wants them, so each is passed on as it is.
const engine = (path: string) => (n2k: PGN_127489) =>
  `propulsion.${skEngineId(n2k)}.${path}`

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

const status2Notifications: Notification[] = [
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

function generateMappingsForStatus(
  field: string,
  notifications: Notification[]
) {
  notifications.forEach((notif) => {
    mappings.push({
      node: (n2k: PGN_127489) => format(notif.node, skEngineId(n2k)),
      filter: (n2k: PGN_127489) =>
        typeof (n2k.fields as any)[field] !== 'undefined',
      value: (n2k: PGN_127489) => {
        const message = format(notif.message, skEngineTitle(n2k))
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
