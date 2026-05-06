var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

// PGN 127509 has a known encoding bug in canboatjs (bits for acInstance and
// inverterEnable are packed incorrectly), so bypass the roundtrip.
process.env.NO_CANBOATJS = 'true'

describe('127509 inverter status', function () {
  it('converts fields to signalk paths', function () {
    const pgn = {
      timestamp: '2026-05-06T12:00:00.000Z',
      prio: 6,
      src: 35,
      dst: 255,
      pgn: 127509,
      description: 'Inverter Status',
      fields: {
        instance: 0,
        acInstance: 0,
        dcInstance: 0,
        operatingState: 'Invert',
        inverterEnable: 'On'
      }
    }
    var tree = require('./testMapper').toNested(pgn)
    tree.should.have.nested.property(
      'electrical.inverters.0.operatingState.value',
      'invert'
    )
    tree.should.have.nested.property(
      'electrical.inverters.0.enabled.value',
      true
    )
  })

  it('disabled inverter converts', function () {
    const pgn = {
      timestamp: '2026-05-06T12:00:00.000Z',
      prio: 6,
      src: 35,
      dst: 255,
      pgn: 127509,
      description: 'Inverter Status',
      fields: {
        instance: 1,
        acInstance: 0,
        dcInstance: 0,
        operatingState: 'Standby',
        inverterEnable: 'Off'
      }
    }
    var tree = require('./testMapper').toNested(pgn)
    tree.should.have.nested.property(
      'electrical.inverters.1.operatingState.value',
      'standby'
    )
    tree.should.have.nested.property(
      'electrical.inverters.1.enabled.value',
      false
    )
  })
})
