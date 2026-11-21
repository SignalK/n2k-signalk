import { PGN_127503, getEnumerationValue } from '@canboat/ts-pgns'
import { instancePrefix, SourceState } from '../instanceGroups.js'

type Line = PGN_127503['fields']['list'][number]

const fields = [
  'acceptability',
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

function prefix(
  n2k: PGN_127503,
  state: SourceState | undefined,
  lineData: Line
) {
  return `${instancePrefix(n2k, state)}.phase.${acPhase(lineData)}`
}

// Signal K's enum values are lowercase: 'Good' becomes 'good'. The
// acceptability is the only text field of a line.
const lower = (value: unknown) =>
  typeof value === 'string' ? value.toLowerCase() : value

module.exports = [
  (n2k: PGN_127503, state?: SourceState) =>
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
