import { PGN_127501 } from '@canboat/ts-pgns'

module.exports = [
  function (n2k: PGN_127501) {
    // The indicators are read by number, so fields is indexed by name.
    const fields = n2k.fields as unknown as Record<string, unknown>
    const res = []
    for (let i = 1; i <= 28; i++) {
      const field = 'indicator' + i
      if (typeof fields[field] !== 'undefined') {
        const basePath =
          'electrical.switches.bank.' + n2k.fields.instance + '.' + i

        res.push({
          path: basePath + '.state',
          value: fields[field] == 'On' ? 1 : 0
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
