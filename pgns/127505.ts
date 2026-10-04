import { PGN_127505 } from '@canboat/ts-pgns'
const { instancePrefix } = require('../instanceGroups')

// The tank types instanceGroups maps to a tanks.<type> path; others are left out.
const tankMappings: Record<string, string> = {
  Fuel: 'fuel',
  Water: 'freshWater',
  'Gray water': 'wasteWater',
  'Live well': 'liveWell',
  Oil: 'lubrication',
  'Black water': 'blackWater'
}

const tank = (path: string) => (n2k: PGN_127505, state: any) =>
  `${instancePrefix(n2k, state)}.${path}`

const knownType = (n2k: PGN_127505) =>
  tankMappings[n2k.fields.type as string] !== undefined

// canboatjs gives the level as a ratio and the capacity in m3.
module.exports = [
  { source: 'level', node: tank('currentLevel'), filter: knownType },
  { source: 'capacity', node: tank('capacity'), filter: knownType }
]
