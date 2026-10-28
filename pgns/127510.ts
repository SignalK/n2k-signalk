import { PGN_127510 } from '@canboat/ts-pgns'
import { instancePrefix, SourceState } from '../instanceGroups.js'

type Field = keyof PGN_127510['fields']

const charger = (path: string) => (n2k: PGN_127510, state?: SourceState) =>
  `${instancePrefix(n2k, state)}.${path}`

const text = (field: Field) => ({
  value: (n2k: PGN_127510) => String(n2k.fields[field]).toLowerCase(),
  filter: (n2k: PGN_127510) => typeof n2k.fields[field] === 'string'
})

const onOff = (field: Field) => ({
  value: (n2k: PGN_127510) => n2k.fields[field] === 'On',
  filter: (n2k: PGN_127510) => typeof n2k.fields[field] === 'string'
})

const number = (field: Field) => ({
  value: (n2k: PGN_127510) => n2k.fields[field],
  filter: (n2k: PGN_127510) => typeof n2k.fields[field] === 'number'
})

module.exports = [
  { node: charger('enabled'), ...onOff('chargerEnableDisable') },
  // Not a current: the limit as a ratio (0-1) of the charger's designed
  // maximum output current (NMEA 2000 DD263, a percentage on the bus).
  { node: charger('chargeCurrentLimit'), ...number('chargeCurrentLimit') },
  { node: charger('chargingAlgorithm'), ...text('chargingAlgorithm') },
  { node: charger('chargeMode'), ...text('chargerMode') },
  { node: charger('estimatedTemperature'), ...text('estimatedTemperature') },
  {
    node: charger('equalizeOneTimeEnabled'),
    ...onOff('equalizeOneTimeEnableDisable')
  },
  { node: charger('overChargeEnabled'), ...onOff('overChargeEnableDisable') },
  { node: charger('equalizeTime'), ...number('equalizeTime') }
]
