import { PGN_127505 } from '@canboat/ts-pgns'
import { instancePrefix, skTankType, SourceState } from '../instanceGroups.js'

const tank = (path: string) => (n2k: PGN_127505, state?: SourceState) =>
  `${instancePrefix(n2k, state)}.${path}`

const knownType = (n2k: PGN_127505) => skTankType(n2k.fields.type) !== undefined

// canboatjs gives the level as a ratio and the capacity in m3.
module.exports = [
  { source: 'level', node: tank('currentLevel'), filter: knownType },
  { source: 'capacity', node: tank('capacity'), filter: knownType }
]
