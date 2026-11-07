import { PGN_127747, PGN_127748, PGN_127749 } from '@canboat/ts-pgns'
import { instancePrefix, SourceState } from '../instanceGroups.js'

// 127747, 127748 and 127749 carry the same fields, one PGN per phase.
type AcVoltage = PGN_127747 | PGN_127748 | PGN_127749

module.exports = (phase: string) => {
  const ac = (path: string) => (n2k: AcVoltage, state?: SourceState) =>
    `${instancePrefix(n2k, state)}.${phase}.${path}`

  return [
    { source: 'acVoltageLineToNeutral', node: ac('lineNeutralVoltage') },
    { source: 'acVoltageLineToLine', node: ac('lineLineVoltage') },
    { source: 'frequency', node: ac('frequency') }
  ]
}
