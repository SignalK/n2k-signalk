import { PGN_127501 } from '@canboat/ts-pgns'

// NMEA 2000's 2-bit indicator: 0 off, 1 on, 2 error, 3 not available. An
// error is kept apart from off: for an input such as a smoke or bilge sensor
// it means the sensor cannot be read, not that all is quiet. canboat versions
// that do not name 2 give the bare number. Any other value is left out.
const INDICATOR_STATES = new Map<string, number>([
  ['Off', 0],
  ['On', 1],
  ['Error', 2],
  ['0', 0],
  ['1', 1],
  ['2', 2]
])

module.exports = [
  function (n2k: PGN_127501) {
    // The indicators are read by number, so fields is indexed by name.
    const fields = n2k.fields as unknown as Record<string, unknown>
    const res = []
    for (let i = 1; i <= 28; i++) {
      const state = INDICATOR_STATES.get(String(fields['indicator' + i]))
      if (state !== undefined) {
        const basePath =
          'electrical.switches.bank.' + n2k.fields.instance + '.' + i

        res.push({
          path: basePath + '.state',
          value: state
        })

        res.push({
          path: basePath + '.order',
          value: i
        })
      }
    }
    return res
  }
]
