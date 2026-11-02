const chai = require('chai')
chai.Should()

const { FromPgn } = require('@canboat/canboatjs')
const { N2kMapper } = require('../dist/n2kMapper')

// Frames captured from Simrad autopilots, from canboat's samples/.
function values (line) {
  const n2k = new FromPgn({ useCamel: true }).parseString(line)
  return new N2kMapper().toDelta(n2k).updates[0].values
}

describe('65341 Simnet autopilot angle', function () {
  it('writes a heading target as headingMagnetic', function () {
    // ac42-commissioning.raw
    values(
      '2026-06-08T01:59:45.139,6,65341,13,255,8,41,9f,ff,ff,02,ff,db,9e'
    ).should.deep.equal([
      { path: 'steering.autopilot.target.headingMagnetic', value: 4.0667 }
    ])
  })

  it('writes a nav and a no-drift target as headingMagnetic', function () {
    // maneuvers.raw, ac42-commissioning.raw
    values(
      '2026-07-10T06:27:57.662Z,6,65341,19,255,8,41,9f,ff,ff,0a,ff,00,00'
    ).should.deep.equal([
      { path: 'steering.autopilot.target.headingMagnetic', value: 0 }
    ])
    values(
      '2026-06-08T01:52:16.955,6,65341,13,255,8,41,9f,ff,ff,0b,ff,00,00'
    ).should.deep.equal([
      { path: 'steering.autopilot.target.headingMagnetic', value: 0 }
    ])
  })

  it('writes a wind target as a signed windAngleApparent', function () {
    // ap48-tack.all: 5.5479 rad, 42° to port.
    const [value] = values(
      '2026-07-05T00:04:57.125Z,6,65341,19,255,8,41,9f,ff,ff,03,ff,b7,d8'
    )
    value.path.should.equal('steering.autopilot.target.windAngleApparent')
    value.value.should.be.closeTo(5.5479 - 2 * Math.PI, 1e-9)
  })

  it('writes nothing without an angle, or for an unknown mode', function () {
    // ac42-commissioning.raw: Heading and Wind without an angle, mode 13.
    values(
      '2026-06-08T01:52:17.047,6,65341,13,255,8,41,9f,ff,ff,02,ff,ff,ff'
    ).should.deep.equal([])
    values(
      '2026-06-08T01:52:17.047,6,65341,13,255,8,41,9f,ff,ff,03,ff,ff,ff'
    ).should.deep.equal([])
    values(
      '2026-06-08T01:52:12.926,6,65341,13,255,8,41,9f,ff,ff,0d,ff,ff,7f'
    ).should.deep.equal([])
  })
})
