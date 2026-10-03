import { PGN_127505 } from '@canboat/ts-pgns'

const tankMappings: Record<string, string> = {
  Fuel: 'fuel',
  Water: 'freshWater',
  'Gray water': 'wasteWater',
  'Live well': 'liveWell',
  Oil: 'lubrication',
  'Black water': 'blackWater'
}

const tank = (path: string) => (n2k: PGN_127505) =>
  `tanks.${tankMappings[n2k.fields.type as string]}.${n2k.fields.instance}.${path}`

// canboatjs gives the level as a ratio and the capacity in m3.
module.exports = [
  { source: 'level', node: tank('currentLevel') },
  { source: 'capacity', node: tank('capacity') }
]
