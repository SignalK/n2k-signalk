import { PGN_127509 } from '@canboat/ts-pgns'
import { instancePrefix, SourceState } from '../instanceGroups.js'

const inverter = (path: string) => (n2k: PGN_127509, state?: SourceState) =>
  `${instancePrefix(n2k, state)}.${path}`

module.exports = [
  {
    node: inverter('operatingState'),
    value: (n2k: PGN_127509) => String(n2k.fields.operatingState).toLowerCase(),
    filter: (n2k: PGN_127509) => typeof n2k.fields.operatingState === 'string'
  },
  {
    node: inverter('enabled'),
    value: (n2k: PGN_127509) => n2k.fields.inverterEnable === 'On',
    filter: (n2k: PGN_127509) => typeof n2k.fields.inverterEnable === 'string'
  }
]
