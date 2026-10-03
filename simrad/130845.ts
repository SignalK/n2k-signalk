import { PGN_130845_SimnetKeyValue } from '@canboat/ts-pgns'
import camelCase from 'camelcase'

// The network group the display belongs to: networkGroup, or displayGroup
// where the PGN definition still calls it that.
const group = (n2k: PGN_130845_SimnetKeyValue): unknown =>
  n2k.fields.networkGroup ?? (n2k.fields as any).displayGroup

const isKey = (key: string) => (n2k: PGN_130845_SimnetKeyValue) =>
  (n2k.fields.manufacturerCode as unknown) === 'Simrad' &&
  typeof group(n2k) === 'string' &&
  (n2k.fields.key as unknown) === key

const display = (path: string) => (n2k: PGN_130845_SimnetKeyValue) =>
  `electrical.displays.navico.${camelCase(group(n2k) as string)}.${path}`

/**
 * The backlight as a ratio. canboatjs gives a level the lookup names as its
 * label ("90%", "10% (Min)", "100% (Max)"); a level between those steps
 * (newer displays set any of 0-99) as the number, on a 0-99 scale.
 */
function backlight(value: unknown): number | null {
  if (typeof value === 'string') {
    const percent = /^(\d+)%/.exec(value)
    return percent ? Number(percent[1]) / 100 : null
  }
  if (typeof value === 'number') {
    return Math.min(Math.max(value / 99, 0), 1)
  }
  return null
}

module.exports = [
  {
    filter: isKey('Backlight level'),
    node: display('brightness'),
    allowNull: true,
    value: (n2k: PGN_130845_SimnetKeyValue) => backlight(n2k.fields.value)
  },
  {
    filter: isKey('Night mode'),
    node: display('nightMode.state'),
    allowNull: true,
    // canboatjs gives the SIMNET_NIGHT_MODE name: Day or Night.
    value: (n2k: PGN_130845_SimnetKeyValue) => {
      const mode = n2k.fields.value as unknown
      return mode === 'Night' ? 1 : mode === 'Day' ? 0 : null
    }
  },
  {
    filter: isKey('Night mode color'),
    node: display('nightModeColor'),
    allowNull: true,
    // canboatjs gives the SIMNET_NIGHT_MODE_COLOR name: Red, Green, ...
    value: (n2k: PGN_130845_SimnetKeyValue) => {
      const color = n2k.fields.value as unknown
      return typeof color === 'string' ? color.toLowerCase() : 'unknown'
    }
  }
]
