import { PGN_127744, PGN_127745, PGN_127746 } from '@canboat/ts-pgns'
import { instancePrefix, SourceState } from '../instanceGroups.js'

// 127744, 127745 and 127746 carry the same fields, one PGN per phase.
type AcPower = PGN_127744 | PGN_127745 | PGN_127746

module.exports = (phase: string) => {
  const ac = (path: string) => (n2k: AcPower, state?: SourceState) =>
    `${instancePrefix(n2k, state)}.${phase}.${path}`

  return [
    {
      node: ac('power'),
      value: (n2k: AcPower) => n2k.fields.power,
      filter: (n2k: AcPower) => typeof n2k.fields.power !== 'undefined'
    },
    {
      node: ac('current'),
      value: (n2k: AcPower) => n2k.fields.acRmsCurrent,
      filter: (n2k: AcPower) => typeof n2k.fields.acRmsCurrent !== 'string'
    }
  ]
}
