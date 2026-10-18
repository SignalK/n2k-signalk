import { PGN_65345_SeatalkPilotWindDatum } from '@canboat/ts-pgns'

// Proprietary PGN numbers are shared between manufacturers, and canboatjs
// decodes another manufacturer's 65345 with the range's catch-all, which has
// no windDatum: only a record with a finite windDatum gives an angle.
module.exports = [
  {
    node: 'steering.autopilot.target.windAngleApparent',
    filter: (n2k: PGN_65345_SeatalkPilotWindDatum) =>
      Number.isFinite(n2k.fields.windDatum),
    value: function (n2k: PGN_65345_SeatalkPilotWindDatum) {
      let angle = Number(n2k.fields.windDatum)
      if (angle > Math.PI) angle = angle - Math.PI * 2
      return angle
    }
  }
]
