import { PGN_127237, DirectionReference } from '@canboat/ts-pgns'

module.exports = [
  {
    source: 'headingToSteerCourse',
    node: function (n2k: PGN_127237) {
      const reference =
        n2k.fields.headingReference === DirectionReference.Magnetic
          ? 'Magnetic'
          : 'True'
      return `steering.autopilot.target.heading${reference}`
    },
    filter: function (n2k: PGN_127237) {
      return typeof n2k.fields.headingToSteerCourse !== 'undefined'
    }
  }
]
