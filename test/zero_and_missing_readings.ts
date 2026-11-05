import chai from 'chai'
chai.should()

import { N2kMapper } from '../dist/n2kMapper'

// #383. canboat's samples hold no reading of exactly 0 for these fields, so
// the frames are written here, as canboatjs decodes them (in SI).
function frame(pgn: number, fields: Record<string, unknown>) {
  return {
    timestamp: '2026-11-05T10:00:00.000Z',
    prio: 2,
    src: 3,
    dst: 255,
    pgn,
    fields
  }
}

function values(n2k: any): Record<string, unknown> {
  const delta = new N2kMapper().toDelta(n2k)
  const res: Record<string, unknown> = {}
  ;(delta?.updates[0]?.values ?? []).forEach((pv: any) => {
    res[pv.path] = pv.value
  })
  return res
}

describe('a reading of 0', function () {
  it('writes a position on the equator or the prime meridian', function () {
    ;[129025, 129029, 129038, 129039, 129040, 129041, 129793, 129798].forEach(
      (pgn) => {
        ;[
          { latitude: 0, longitude: 5.37 },
          { latitude: 53.13, longitude: 0 }
        ].forEach((position) => {
          values(frame(pgn, { userId: 244850565, ...position }))[
            'navigation.position'
          ]!.should.deep.equal(position)
        })
      }
    )
  })

  it('writes a speed over ground of 0', function () {
    values(frame(128259, { sid: 0, speedGroundReferenced: 0 }))[
      'navigation.speedOverGround'
    ]!.should.equal(0)
    values(frame(130577, { sid: 0, cogReference: 'True', sog: 0 }))[
      'navigation.speedOverGround'
    ]!.should.equal(0)
  })

  it('writes a current set due north, and a drift of 0', function () {
    values(frame(130577, { cogReference: 'True', set: 0, drift: 0.5 }))[
      'environment.current'
    ]!.should.deep.equal({ setTrue: 0, drift: 0.5 })
    values(frame(130577, { cogReference: 'True', set: 1, drift: 0 }))[
      'environment.current'
    ]!.should.deep.equal({ setTrue: 1, drift: 0 })
  })

  it('writes a 0 length and a reference point on the starboard side', function () {
    const v = values(
      frame(129040, {
        userId: 244850565,
        length: 0,
        beam: 4,
        positionReferenceFromStarboard: 0
      })
    )
    v['design.length']!.should.deep.equal({ overall: 0 })
    v.should.have.property('sensors.ais.fromCenter')
  })

  it('writes 0 readings of 130310', function () {
    const v = values(
      frame(130310, {
        waterTemperature: 0,
        outsideAmbientAirTemperature: 0,
        atmosphericPressure: 0
      })
    )
    v['environment.water.temperature']!.should.equal(0)
    v['environment.outside.temperature']!.should.equal(0)
    v['environment.outside.pressure']!.should.equal(0)
  })
})

describe('a missing reading', function () {
  it('writes no position at 0,0', function () {
    // Some AIS transponders and GPS receivers send 0,0 without a fix.
    ;[129025, 129029, 129038, 129039, 129040, 129041, 129793, 129798].forEach(
      (pgn) => {
        values(
          frame(pgn, { userId: 244850565, latitude: 0, longitude: 0 })
        ).should.not.have.property('navigation.position')
      }
    )
  })

  it('writes no current without a set or a drift', function () {
    ;[{ drift: 0.5 }, { set: 1 }].forEach((fields) => {
      values(
        frame(129291, { setReference: 'True', ...fields })
      ).should.not.have.property('environment.current')
      values(
        frame(130577, { cogReference: 'True', ...fields })
      ).should.not.have.property('environment.current')
    })
  })

  it('writes no wind angle without one', function () {
    ;['Apparent', 'True (boat referenced)'].forEach((reference) => {
      const v = values(frame(130306, { windSpeed: 5, reference }))
      v.should.not.have.property('environment.wind.angleApparent')
      v.should.not.have.property('environment.wind.angleTrueWater')
    })
  })

  it('writes no autopilot state for a Simnet pilot mode frame without a mode', function () {
    values({
      ...frame(65305, {
        manufacturerCode: 'Simrad',
        industryCode: 'Marine Industry',
        model: 'AC',
        report: 'Mode'
      }),
      description: 'Simnet: Pilot Mode'
    }).should.not.have.property('steering.autopilot.state')
  })
})
