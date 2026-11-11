import { PGN_127504, getEnumerationValue } from '@canboat/ts-pgns'
import { instancePrefix, SourceState } from '../instanceGroups.js'

type Line = PGN_127504['fields']['list'][number]

const fields = [
  'waveform',
  'voltage',
  'current',
  'frequency',
  'breakerSize',
  'realPower',
  'reactivePower',
  'powerFactor'
] as const

const phaseMap: Record<string, string> = { 0: 'A', 1: 'B', 2: 'C' }

// The specification's names for a line's voltage to neutral and its
// breaker's rated current
const SK_FIELDS: Partial<Record<(typeof fields)[number], string>> = {
  voltage: 'lineNeutralVoltage',
  breakerSize: 'breaker.ratedCurrent'
}
const skField = (field: (typeof fields)[number]) => SK_FIELDS[field] ?? field

// canboatjs decodes line through AC_LINE, so it arrives as 'Line 1' to
// 'Line 3', codes 0 to 2 (#367).
function acPhase(lineData: Line) {
  const { line } = lineData
  const code =
    typeof line === 'string' ? getEnumerationValue('AC_LINE', line) : line
  return phaseMap[String(code)] ?? 'A'
}

// The specification gives an inverter's AC output one phase, under ac. A
// three-phase inverter's lines 2 and 3 go under ac.phase.B and ac.phase.C,
// as electrical.ac.<id>.phase does for AC buses.
function prefix(
  n2k: PGN_127504,
  state: SourceState | undefined,
  lineData: Line
) {
  const phase = acPhase(lineData)
  return phase === 'A'
    ? `${instancePrefix(n2k, state)}.ac`
    : `${instancePrefix(n2k, state)}.ac.phase.${phase}`
}

// Signal K's enum values are lowercase: 'Sine wave' becomes 'sine wave'. The
// waveform is the only text field of a line.
const lower = (value: unknown) =>
  typeof value === 'string' ? value.toLowerCase() : value

module.exports = [
  (n2k: PGN_127504, state?: SourceState) =>
    n2k.fields.list
      ? n2k.fields.list.flatMap((lineData) => {
          const pathPrefix = prefix(n2k, state, lineData)
          return fields
            .filter((field) => typeof lineData[field] !== 'undefined')
            .map((field) => ({
              path: `${pathPrefix}.${skField(field)}`,
              value: lower(lineData[field])
            }))
        })
      : []
]
