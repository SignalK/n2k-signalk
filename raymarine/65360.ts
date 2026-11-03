import { PGN_65360_SeatalkPilotLockedHeading } from '@canboat/ts-pgns'

module.exports = [
  {
    node: 'steering.autopilot.target.headingTrue',
    filter: function (n2k: PGN_65360_SeatalkPilotLockedHeading) {
      return n2k.fields.targetHeadingTrue
    },
    source: 'targetHeadingTrue'
  },
  {
    node: 'steering.autopilot.target.headingMagnetic',
    filter: function (n2k: PGN_65360_SeatalkPilotLockedHeading) {
      return n2k.fields.targetHeadingMagnetic
    },
    source: 'targetHeadingMagnetic'
  }
]
