import { PGN_127744, PGN_127745, PGN_127746 } from '@canboat/ts-pgns'
import { instancePrefix, SourceState } from '../instanceGroups.js'

// 127744, 127745 and 127746 carry the same fields, one PGN per phase.
type AcPower = PGN_127744 | PGN_127745 | PGN_127746

module.exports = (phase: string) => {
  const ac = (path: string) => (n2k: AcPower, state?: SourceState) =>
    `${instancePrefix(n2k, state)}.${phase}.${path}`

  // A device not yet known by name has no default prefix.
  const hasPrefix = (n2k: AcPower, state?: SourceState) =>
    instancePrefix(n2k, state) != null

  return [
    {
      node: ac('realPower'),
      value: (n2k: AcPower) => n2k.fields.power,
      filter: (n2k: AcPower, state?: SourceState) =>
        typeof n2k.fields.power !== 'undefined' && hasPrefix(n2k, state)
    },
    {
      node: ac('current'),
      value: (n2k: AcPower) => n2k.fields.acRmsCurrent,
      filter: (n2k: AcPower, state?: SourceState) =>
        typeof n2k.fields.acRmsCurrent !== 'string' && hasPrefix(n2k, state)
    }
  ]
}
