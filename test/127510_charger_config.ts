import chai from 'chai'
chai.should()
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
    const tree = require('./testMapper').toNested(pgn)
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

  it('writes no enabled state for a reserved or no-change value', function () {
    const tree = require('./testMapper').n2kToNested({
      pgn: 127510,
      src: 35,
      timestamp: '2026-05-06T12:00:00.000Z',
      fields: {
        instance: 0,
        batteryInstance: 0,
        chargerEnableDisable: 'Take no action (no change)',
        equalizeOneTimeEnableDisable: 'Reserved',
        overChargeEnableDisable: 'Off'
      }
    })
    tree.should.not.have.nested.property('electrical.chargers.0.enabled')
    tree.should.not.have.nested.property(
      'electrical.chargers.0.equalizeOneTimeEnabled'
    )
    tree.should.have.nested.property(
      'electrical.chargers.0.overChargeEnabled.value',
      false
    )
  })
})
