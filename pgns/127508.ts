import { PGN_127508 } from '@canboat/ts-pgns'
import { instancePrefix, SourceState } from '../instanceGroups.js'

const battery = (path: string) => (n2k: PGN_127508, state?: SourceState) =>
  `${instancePrefix(n2k, state)}.${path}`

module.exports = [
  { source: 'voltage', node: battery('voltage') },
  { source: 'current', node: battery('current') },
  { source: 'temperature', node: battery('temperature') }
]
