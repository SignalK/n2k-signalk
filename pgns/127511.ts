import { PGN_127511 } from '@canboat/ts-pgns'
import { instancePrefix, SourceState } from '../instanceGroups.js'

type Field = keyof PGN_127511['fields']

const inverter = (path: string) => (n2k: PGN_127511, state?: SourceState) =>
  `${instancePrefix(n2k, state)}.${path}`

const text = (field: Field) => ({
  value: (n2k: PGN_127511) => String(n2k.fields[field]).toLowerCase(),
  filter: (n2k: PGN_127511) => typeof n2k.fields[field] === 'string'
})

const onOff = (field: Field) => ({
  value: (n2k: PGN_127511) => n2k.fields[field] === 'On',
  filter: (n2k: PGN_127511) => typeof n2k.fields[field] === 'string'
})

const number = (field: Field) => ({
  value: (n2k: PGN_127511) => n2k.fields[field],
  filter: (n2k: PGN_127511) => typeof n2k.fields[field] === 'number'
})

module.exports = [
  { node: inverter('enabled'), ...onOff('inverterEnableDisable') },
  { node: inverter('inverterMode'), ...text('inverterMode') },
  { node: inverter('loadSenseEnabled'), ...onOff('loadSenseEnableDisable') },
  {
    node: inverter('loadSensePowerThreshold'),
    ...number('loadSensePowerThreshold')
  },
  { node: inverter('loadSenseInterval'), ...number('loadSenseInterval') }
]
