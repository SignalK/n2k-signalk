import chai from 'chai'
chai.should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

import { FromPgn } from '@canboat/canboatjs'
const mapper = require('./testMapper')

// A Simrad display's MOB, raised and cancelled, from canboat's
// samples/simrad_mob_quick.raw. The display sends 127233 again on cancel,
// with the status MOB Not Active; its paired 130850 carries no position.
const SIMRAD_MOB_ACTIVATED =
  '2026-06-25T13:49:28.626Z,3,127233,30,255,35,ff,ff,ff,ff,ff,f8,c9,35,00,00,f9,ff,ff,ff,ff,00,00,f6,ff,6d,0b,04,86,4e,67,ff,98,ec,e8,00,87,12,8c,0e,ff'
const SIMRAD_MOB_CANCELLED =
  '2026-06-25T13:49:35.480Z,3,127233,30,255,35,ff,ff,ff,ff,ff,fb,c9,35,00,00,f9,ff,ff,ff,ff,00,00,f6,ff,6d,0b,04,86,4e,67,ff,98,ec,e8,00,87,12,8c,0e,ff'

// The captured activation with another 3 bit MOB status (byte 6, f8 = 0).
function withStatus(status: number) {
  const parts = SIMRAD_MOB_ACTIVATED.split(',')
  parts[11] = (0xf8 | status).toString(16)
  return parts.join(',')
}

function decode(line: string): any {
  return new FromPgn({ useCamel: true }).parseString(line)
}

// A chartplotter's MOB button: the vessel's position, the button's emitter.
function mobFrame(fields: Record<string, unknown> = {}) {
  return {
    timestamp: '2026-11-07T19:30:05.000Z',
    prio: 3,
    src: 1,
    dst: 255,
    pgn: 127233,
    fields: {
      sid: 0,
      mobEmitterId: 1,
      manOverboardStatus: 'Manual on-board MOB Button Activation',
      activationTime: 70200,
      positionSource: 'Position estimated by the vessel',
      positionDate: '2026.11.07',
      positionTime: 70205,
      latitude: 60.1512345,
      longitude: 24.9512345,
      cogReference: 'True',
      cog: 1.5708,
      sog: 0.5,
      mmsiOfVesselOfOrigin: '230123456',
      mobEmitterBatteryLowStatus: 'Good',
      ...fields
    }
  }
}

function mobValue(delta: any) {
  const values = delta.updates[0].values
  values.should.have.length(1)
  return values[0]
}

describe('127233 Man Overboard Notification', function () {
  it('a Simrad display raises a MOB and clears it on the same path', function () {
    const raised = mobValue(mapper.toDelta(decode(SIMRAD_MOB_ACTIVATED)))
    raised.path.should.equal('notifications.mob.unset')
    raised.value.state.should.equal('emergency')
    raised.value.method.should.deep.equal(['visual', 'sound'])
    raised.value.position.latitude.should.be.closeTo(19.1758326, 0.0000001)
    raised.value.position.longitude.should.be.closeTo(173.3199364, 0.0000001)
    raised.value.data.mmsiOfVesselOfOrigin.should.equal('244060807')

    const cleared = mobValue(mapper.toDelta(decode(SIMRAD_MOB_CANCELLED)))
    cleared.path.should.equal('notifications.mob.unset')
    cleared.value.state.should.equal('normal')
    cleared.value.method.should.deep.equal([])
  })

  it('an activated MOB raises an emergency at the MOB position', function () {
    const delta = mapper.testToDelta(mobFrame())
    ;(delta.context === undefined).should.equal(true)
    const { path, value } = mobValue(delta)

    path.should.equal('notifications.mob.1')
    value.state.should.equal('emergency')
    value.method.should.deep.equal(['visual', 'sound'])
    value.message.should.equal('Person Overboard!')
    value.position.latitude.should.be.closeTo(60.1512345, 0.0000001)
    value.position.longitude.should.be.closeTo(24.9512345, 0.0000001)
    value.createdAt.should.equal('2026-11-07T19:30:00.000Z')
    value.data.should.include({
      mobEmitterId: 1,
      manOverboardStatus: 'Manual on-board MOB Button Activation',
      positionSource: 'Position estimated by the vessel',
      mmsiOfVesselOfOrigin: '230123456',
      batteryLow: 'Good'
    })
    value.data.sog.should.be.closeTo(0.5, 0.01)
    delta.should.be.validSignalKDelta
  })

  it('a MOB emitter raises its own notification', function () {
    const delta = mapper.testToDelta(
      mobFrame({
        mobEmitterId: 970123456,
        manOverboardStatus: 'MOB Emitter Activated',
        positionSource: 'Position reported by MOB emitter'
      })
    )
    const { path, value } = mobValue(delta)
    path.should.equal('notifications.mob.970123456')
    value.state.should.equal('emergency')
  })

  it('a MOB that is no longer active returns to normal on the same path', function () {
    const { path, value } = mobValue(
      mapper.testToDelta(mobFrame({ manOverboardStatus: 'MOB Not Active' }))
    )
    path.should.equal('notifications.mob.1')
    value.state.should.equal('normal')
    value.method.should.deep.equal([])
  })

  it('test mode raises only a visual alert', function () {
    const { value } = mobValue(mapper.toDelta(decode(withStatus(2))))
    value.data.manOverboardStatus.should.equal('Test mode')
    value.state.should.equal('alert')
    value.method.should.deep.equal(['visual'])
  })

  it('a reserved status is still an emergency', function () {
    const { value } = mobValue(mapper.toDelta(decode(withStatus(4))))
    value.data.manOverboardStatus.should.equal(4)
    value.state.should.equal('emergency')
    value.method.should.deep.equal(['visual', 'sound'])
  })

  it('a MOB without status, position or times is still an emergency', function () {
    const { path, value } = mobValue(
      mapper.testToDelta({
        ...mobFrame(),
        fields: { mmsiOfVesselOfOrigin: '230123456' }
      })
    )
    path.should.equal('notifications.mob.unset')
    value.state.should.equal('emergency')
    value.should.not.have.property('position')
    value.should.not.have.property('createdAt')
  })

  it('an activation at midnight is dated midnight of the position day', function () {
    const { value } = mobValue(
      mapper.testToDelta(
        mobFrame({
          activationTime: 0,
          positionDate: '2026.11.08',
          positionTime: 20
        })
      )
    )
    value.createdAt.should.equal('2026-11-08T00:00:00.000Z')
  })

  it('an activation later in the day than the position report has no date', function () {
    const { value } = mobValue(
      mapper.testToDelta(
        mobFrame({
          activationTime: 86390,
          positionDate: '2026.11.08',
          positionTime: 20
        })
      )
    )
    value.should.not.have.property('createdAt')
    value.state.should.equal('emergency')
  })

  it('a time that is not a time of day gives no date', function () {
    for (const [activationTime, positionTime] of [
      [-1, 60],
      [60, 86400]
    ]) {
      const { value } = mobValue(
        mapper.toDelta(mobFrame({ activationTime, positionTime }))
      )
      value.should.not.have.property('createdAt')
    }
  })
})
