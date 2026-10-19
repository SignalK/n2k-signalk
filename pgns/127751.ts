import { PGN_127751 } from '@canboat/ts-pgns'
import { instancePrefix, SourceState } from '../instanceGroups.js'

const dc = (path: string) => (n2k: PGN_127751, state?: SourceState) =>
  `${instancePrefix(n2k, state)}.${path}`

module.exports = [
  { source: 'dcVoltage', node: dc('voltage') },
  { source: 'dcCurrent', node: dc('current') }
]
