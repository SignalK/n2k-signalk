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

// canboatjs decodes line through AC_LINE, so it arrives as 'Line 1' to
// 'Line 3', codes 0 to 2 (#367).
function acPhase (lineData: Line) {
  const { line } = lineData
  const code =
    typeof line === 'string' ? getEnumerationValue('AC_LINE', line) : line
  return phaseMap[String(code)] ?? 'A'
}

function prefix (
  n2k: PGN_127503,
  state: SourceState | undefined,
  lineData: Line
) {
  return `${instancePrefix(n2k, state)}.${acPhase(lineData)}`
}

module.exports = [
  (n2k: PGN_127503, state?: SourceState) =>
    n2k.fields.list
      ? n2k.fields.list.flatMap(lineData => {
          const pathPrefix = prefix(n2k, state, lineData)
          return fields
            .filter(field => typeof lineData[field] !== 'undefined')
            .map(field => ({
              path: `${pathPrefix}.${field}`,
              value: lineData[field]
            }))
        })
      : []
]
