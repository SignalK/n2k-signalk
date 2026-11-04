import { PGN_130567 } from '@canboat/ts-pgns'
import { seconds } from '../utils.js'

// PGN 130567 carries no instance field, so all values map to instance 0.
const wmId = () => 0

type Fields = PGN_130567['fields']

const watermaker = (path: string) => () => `watermaker.${wmId()}.${path}`

function yesNo(field: keyof Fields) {
  return (n2k: PGN_130567) => {
    const v = n2k.fields[field] as unknown
    return typeof v === 'undefined' ? null : v === 'Yes'
  }
}

// canboatjs gives every value in SI: salinity as a ratio, flows in m3/s,
// pressures in Pa, temperatures in K, the run time in seconds.
const mappings: any[] = [
  { source: 'watermakerOperatingState', node: watermaker('state') },
  { node: watermaker('production'), value: yesNo('productionStartStop') },
  { node: watermaker('rinsing'), value: yesNo('rinseStartStop') },
  {
    node: watermaker('lowPressurePump'),
    value: yesNo('lowPressurePumpStatus')
  },
  {
    node: watermaker('highPressurePump'),
    value: yesNo('highPressurePumpStatus')
  },
  { node: watermaker('emergencyStop'), value: yesNo('emergencyStop') },
  { node: watermaker('flushMode'), value: yesNo('flushModeStatus') },
  { source: 'salinity', node: watermaker('salinity') },
  {
    source: 'productWaterTemperature',
    node: watermaker('productWaterTemperature')
  },
  { source: 'preFilterPressure', node: watermaker('preFilterPressure') },
  { source: 'postFilterPressure', node: watermaker('postFilterPressure') },
  { source: 'feedPressure', node: watermaker('feedPressure') },
  { source: 'systemHighPressure', node: watermaker('systemHighPressure') },
  { source: 'productWaterFlow', node: watermaker('productWaterFlow') },
  { source: 'brineWaterFlow', node: watermaker('brineWaterFlow') },
  {
    node: watermaker('runTime'),
    value: (n2k: PGN_130567) => seconds(n2k.fields.runTime)
  }
]

const warningNotifications: {
  field: keyof Fields
  name: string
  message: string
}[] = [
  {
    field: 'productSolenoidValveStatus',
    name: 'productSolenoidValve',
    message: 'Watermaker Product Solenoid Valve'
  },
  { field: 'salinityStatus', name: 'salinity', message: 'Watermaker Salinity' },
  { field: 'sensorStatus', name: 'sensor', message: 'Watermaker Sensor' },
  {
    field: 'oilChangeIndicatorStatus',
    name: 'oilChange',
    message: 'Watermaker Oil Change'
  },
  { field: 'filterStatus', name: 'filter', message: 'Watermaker Filter' },
  { field: 'systemStatus', name: 'system', message: 'Watermaker System' }
]

warningNotifications.forEach((notif) => {
  mappings.push({
    node: () => `notifications.watermaker.${wmId()}.${notif.name}`,
    filter: (n2k: PGN_130567) => typeof n2k.fields[notif.field] !== 'undefined',
    value: (n2k: PGN_130567) =>
      (n2k.fields[notif.field] as unknown) === 'Warning'
        ? {
            state: 'alert',
            method: ['visual'],
            message: notif.message + ' Warning'
          }
        : { state: 'normal', method: [], message: notif.message + ' is Normal' }
  })
})

mappings.push({
  node: () => `notifications.watermaker.${wmId()}.emergencyStop`,
  filter: (n2k: PGN_130567) => typeof n2k.fields.emergencyStop !== 'undefined',
  value: (n2k: PGN_130567) =>
    (n2k.fields.emergencyStop as unknown) === 'Yes'
      ? {
          state: 'emergency',
          method: ['visual', 'sound'],
          message: 'Watermaker Emergency Stop'
        }
      : {
          state: 'normal',
          method: [],
          message: 'Watermaker Emergency Stop is Normal'
        }
})

module.exports = mappings
