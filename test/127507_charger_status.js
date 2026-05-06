var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

// PGN 127507 has a known encoding bug in canboatjs (bit-packing issues),
// so bypass the roundtrip.
process.env.NO_CANBOATJS = 'true'

describe('127507 charger status', function () {
  it('complete sentence converts', function () {
    var tree = require('./testMapper').toNested({
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
    var tree = require('./testMapper').toNested({
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
})
