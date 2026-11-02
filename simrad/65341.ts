import { PGN_65341_SimnetAutopilotAngle, SimnetApMode } from '@canboat/ts-pgns'

module.exports = [
  {
    pgnClass: PGN_65341_SimnetAutopilotAngle,

    node: 'steering.autopilot.target.headingMagnetic',

    filter: function (n2k: PGN_65341_SimnetAutopilotAngle) {
      return (
        n2k.fields.mode === SimnetApMode.Heading ||
        n2k.fields.mode === SimnetApMode.Nav ||
        n2k.fields.mode === SimnetApMode.NoDrift
      )
    },

    value: function (n2k: PGN_65341_SimnetAutopilotAngle) {
      return n2k.fields.angle
    }
  },

  {
    pgnClass: PGN_65341_SimnetAutopilotAngle,

    node: 'steering.autopilot.target.windAngleApparent',

    filter: function (n2k: PGN_65341_SimnetAutopilotAngle) {
      return n2k.fields.mode === SimnetApMode.Wind
    },

    // The angle arrives as 0 to 2π; an apparent wind angle is signed.
    value: function (n2k: PGN_65341_SimnetAutopilotAngle) {
      const angle = n2k.fields.angle
      return typeof angle === 'number' && angle > Math.PI
        ? angle - Math.PI * 2
        : angle
    }
  }
]
