import { PGN_127493 } from '@canboat/ts-pgns'
import { format } from 'util'
import { instancePrefix, engineTitle, SourceState } from '../instanceGroups.js'

const transmission = (path: string) => (n2k: PGN_127493, state?: SourceState) =>
  `${instancePrefix(n2k, state)}.transmission.${path}`

const mappings = [
  { source: 'oilTemperature', node: transmission('oilTemperature') },
  { source: 'transmissionGear', node: transmission('gear') },
  {
    node: transmission('oilPressure'),
    value: (n2k: PGN_127493) => {
      const kpa = Number(n2k.fields.oilPressure)
      return isNaN(kpa) ? null : kpa
    }
  }
]

type Notification = { node: string; message: string; analyzerText: string }

const status1Notifications: Notification[] = [
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

function mappingsForStatus (
  field: 'discreteStatus1',
  notifications: Notification[]
) {
  return notifications.map((notif, index) => ({
    node: (n2k: PGN_127493, state?: SourceState) =>
      format(notif.node, instancePrefix(n2k, state)),
    filter: (n2k: PGN_127493) => typeof n2k.fields[field] !== 'undefined',
    value: (n2k: PGN_127493, state?: SourceState) => {
      // ts-pgns types the status as the list of the bits set; it can also
      // arrive as the raw bit field.
      const val = n2k.fields[field] as unknown
      const on =
        typeof val === 'number'
          ? (val & (1 << index)) !== 0
          : (val as string[]).indexOf(notif.analyzerText) != -1
      const message = format(notif.message, engineTitle(n2k, state))
      if (on) {
        return { state: 'alarm', method: ['visual', 'sound'], message }
      }
      return {
        state: 'normal',
        method: ['visual'],
        message: message + ' is Normal'
      }
    }
  }))
}

module.exports = [
  ...mappings,
  ...mappingsForStatus('discreteStatus1', status1Notifications)
]
