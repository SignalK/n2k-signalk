import { PGN_127750 } from '@canboat/ts-pgns'
import { instancePrefix, SourceState } from '../instanceGroups.js'

const converter = (path: string) => (n2k: PGN_127750, state?: SourceState) =>
  `${instancePrefix(n2k, state)}.${path}`

const text = (field: keyof PGN_127750['fields']) => ({
  value: (n2k: PGN_127750) => String(n2k.fields[field]).toLowerCase(),
  filter: (n2k: PGN_127750) => typeof n2k.fields[field] === 'string'
})

module.exports = [
  { node: converter('operatingState'), ...text('operatingState') },
  { node: converter('temperatureState'), ...text('temperatureState') },
  { node: converter('overloadState'), ...text('overloadState') },
  { node: converter('lowDCVoltageState'), ...text('lowDcVoltageState') },
  { node: converter('rippleState'), ...text('rippleState') }
]
