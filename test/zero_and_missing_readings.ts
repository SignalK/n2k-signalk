import chai from 'chai'
chai.should()

import { FromPgn } from '@canboat/canboatjs'
import { N2kMapper } from '../dist/n2kMapper'
import testMapper = require('./testMapper')

// #383. canboat's samples hold no reading of exactly 0 for these fields, so
// these frames are written here, as canboatjs decodes them (in SI). The cases
// for a missing wind angle or pilot mode start from a captured frame instead.
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
  return deltaValues(new N2kMapper().toDelta(n2k))
}

function deltaValues(delta: any): Record<string, unknown> {
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
    // Half the beam of 4 to starboard of the center
    v['sensors.ais.fromCenter']!.should.equal(2)
  })

  it('writes a 129808 position given as strings as numbers', function () {
    values(
      frame(129808, {
        dscMessageAddress: '2448505650',
        latitudeOfVesselReported: '0',
        longitudeOfVesselReported: '5.37'
      })
    )['navigation.position']!.should.deep.equal({
      latitude: 0,
      longitude: 5.37
    })
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
    // From test/130306_wind_data.ts, with the wind angle taken out
    ;['Apparent', 'True (boat referenced)'].forEach((Reference) => {
      const v = deltaValues(
        testMapper.testToDelta({
          timestamp: '2013-10-08-15:47:28.263Z',
          prio: '2',
          src: '1',
          dst: '255',
          pgn: '130306',
          description: 'Wind Data',
          fields: { SID: '67', 'Wind Speed': 6.22, Reference }
        })
      )
      v.should.not.have.property('environment.wind.angleApparent')
      v.should.not.have.property('environment.wind.angleTrueWater')
    })
  })

  it('writes no autopilot state for a Simnet pilot mode frame without a mode', function () {
    // ap48-tack.all, as in test/65305_simnet_pilot_mode.ts
    const captured: any = new FromPgn({ useCamel: true }).parseString(
      '2026-07-05T00:07:13.054Z,1,65305,19,255,8,41,9f,64,0a,08,00,00,00'
    )
    values(captured)['steering.autopilot.state']!.should.equal('standby')

    delete captured.fields.mode
    values(captured).should.not.have.property('steering.autopilot.state')
  })

  it('writes no position that is out of range', function () {
    ;[
      { latitude: 0, longitude: 181 },
      { latitude: 91, longitude: 0 },
      { latitude: -90.5, longitude: 5.37 },
      { latitude: 53.13, longitude: -180.5 }
    ].forEach((position) => {
      values(frame(129025, position)).should.not.have.property(
        'navigation.position'
      )
    })
    values(frame(129025, { latitude: -90, longitude: 180 }))[
      'navigation.position'
    ]!.should.deep.equal({ latitude: -90, longitude: 180 })
  })

  it('writes a 129798 position without an altitude that is no reading', function () {
    ;[null, 'unavailable'].forEach((altitude) => {
      values(
        frame(129798, {
          userId: 244850565,
          latitude: 53.13,
          longitude: 5.37,
          altitude
        })
      )['navigation.position']!.should.deep.equal({
        latitude: 53.13,
        longitude: 5.37
      })
    })
  })

  it('writes no speed through water that is no number', function () {
    values(
      frame(128259, { sid: 0, speedWaterReferenced: 'unavailable' })
    ).should.not.have.property('navigation.speedThroughWater')
  })
})
