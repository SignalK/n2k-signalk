import { PGN_127257 } from '@canboat/ts-pgns'

const axes = ['yaw', 'pitch', 'roll'] as const

// An axis the sender does not measure is N/A on the wire, and canboatjs
// leaves it out of the decoded fields. Leave it out of the value too: the
// schema makes no axis required, and Number(undefined) would be NaN, which
// the server sends as null.
const measured = (n2k: PGN_127257) =>
  axes.filter(axis => Number.isFinite(n2k.fields[axis]))

module.exports = [
  {
    node: 'navigation.attitude',
    value: (n2k: PGN_127257) =>
      Object.fromEntries(
        measured(n2k).map(axis => [axis, Number(n2k.fields[axis])])
      ),
    filter: (n2k: PGN_127257) => measured(n2k).length > 0
  }
]
