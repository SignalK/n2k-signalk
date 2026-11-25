import chai from 'chai'
chai.should()
chai.use(require('chai-things'))

// The Signal K schema lacks paths this PGN maps, such as operatingState, so these
// trees are not validated against it.
describe('127507 charger status', function () {
  it('complete sentence converts', function () {
    const tree = require('./testMapper').toNested({
      timestamp: '2016-11-26T20:40:00.895Z',
      prio: 6,
      src: 10,
      dst: 255,
      pgn: 127507,
      description: 'Charger Status',
      fields: {
        instance: 0,
        batteryInstance: 1,
        operatingState: 'Absorption',
        chargeMode: 'Standalone',
        enabled: 'On',
        equalizationPending: 'Off',
        equalizationTimeRemaining: '01:00:00'
      }
    })
    tree.should.have.nested.property(
      'electrical.chargers.0.operatingState.value',
      'absorption'
    )
    tree.should.have.nested.property(
      'electrical.chargers.0.chargeMode.value',
      'standalone'
    )
    tree.should.have.nested.property(
      'electrical.chargers.0.enabled.value',
      true
    )
    tree.should.have.nested.property(
      'electrical.chargers.0.equalizationPending.value',
      false
    )
    tree.should.have.nested.property(
      'electrical.chargers.0.equalizationTimeRemaining.value',
      3600
    )
  })

  it('camelCase fields convert', function () {
    const tree = require('./testMapper').toNested({
      timestamp: '2016-11-26T20:40:00.895Z',
      prio: 6,
      src: 10,
      dst: 255,
      pgn: 127507,
      description: 'Charger Status',
      fields: {
        instance: 2,
        batteryInstance: 0,
        operatingState: 'Float',
        chargeMode: 'Standalone',
        enabled: 'On',
        equalizationPending: 'Off'
      }
    })
    tree.should.have.nested.property(
      'electrical.chargers.2.operatingState.value',
      'float'
    )
    tree.should.have.nested.property(
      'electrical.chargers.2.enabled.value',
      true
    )
  })

  // Set by hand: no recording has the field in error. canboat with
  // canboat/canboat#1250 names its value 2 Error.
  it('writes no enabled state for an indicator in error', function () {
    const tree = require('./testMapper').n2kToNested({
      pgn: 127507,
      src: 35,
      timestamp: '2026-05-06T12:00:00.000Z',
      fields: {
        instance: 0,
        batteryInstance: 0,
        operatingState: 'Float',
        chargeMode: 'Standalone',
        enabled: 'Error',
        equalizationPending: 'Off'
      }
    })
    tree.should.not.have.nested.property('electrical.chargers.0.enabled')
    tree.should.have.nested.property(
      'electrical.chargers.0.equalizationPending.value',
      false
    )
  })
})
