var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

describe('127510 charger configuration status', function () {
  it('converts fields to signalk paths', function () {
    const pgn = {
      timestamp: '2026-05-06T12:00:00.000Z',
      prio: 6,
      src: 35,
      dst: 255,
      pgn: 127510,
      description: 'Charger Configuration Status',
      fields: {
        instance: 0,
        batteryInstance: 0,
        chargerEnableDisable: 'On',
        chargeCurrentLimit: 0.8, // 80 % of the charger's maximum, not amps
        chargingAlgorithm: '3 stage',
        chargerMode: 'Standalone',
        estimatedTemperature: 'Warm',
        equalizeOneTimeEnableDisable: 'Off',
        overChargeEnableDisable: 'On',
        equalizeTime: 3600
      }
    }
    var tree = require('./testMapper').toNested(pgn)
    tree.should.have.nested.property(
      'electrical.chargers.0.enabled.value',
      true
    )
    tree.should.have.nested.property(
      'electrical.chargers.0.chargeCurrentLimit.value',
      0.8
    )
    tree.should.have.nested.property(
      'electrical.chargers.0.chargingAlgorithm.value',
      '3 stage'
    )
    tree.should.have.nested.property(
      'electrical.chargers.0.chargeMode.value',
      'standalone'
    )
    tree.should.have.nested.property(
      'electrical.chargers.0.estimatedTemperature.value',
      'warm'
    )
    tree.should.have.nested.property(
      'electrical.chargers.0.equalizeOneTimeEnabled.value',
      false
    )
    tree.should.have.nested.property(
      'electrical.chargers.0.overChargeEnabled.value',
      true
    )
    tree.should.have.nested.property(
      'electrical.chargers.0.equalizeTime.value',
      3600
    )
  })
})
