var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

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
        Instance: 0,
        'Battery Instance': 1,
        'Operating State': 'Absorption',
        'Charge Mode': 'Standalone Mode',
        Enabled: 'On',
        'Equalization Pending': 'Off',
        'Equalization Time Remaining': '01:00:00'
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
    var delta = require('./testMapper').testToDelta({
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
        chargeMode: 'Standalone Mode',
        enabled: 'On',
        equalizationPending: 'Off',
        equalizationTimeRemaining: null
      }
    })
    var values = delta.updates[0].values
    values
      .find(v => v.path === 'electrical.chargers.2.operatingState')
      .value.should.equal('float')
    values
      .find(v => v.path === 'electrical.chargers.2.enabled')
      .value.should.equal(true)
  })
})
