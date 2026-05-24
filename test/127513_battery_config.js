var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

// PGN 127513 has sub-byte fields with non-zero BitStart, triggering the
// canboatjs bit-packing bug — bypass the roundtrip.
process.env.NO_CANBOATJS = 'true'

describe('127513 battery configuration status', function () {
  it('converts fields to signalk paths', function () {
    var tree = require('./testMapper').toNested({
      timestamp: '2026-05-06T12:00:00.000Z',
      prio: 6,
      src: 35,
      dst: 255,
      pgn: 127513,
      description: 'Battery Configuration Status',
      fields: {
        instance: 0,
        batteryType: 'AGM',
        supportsEqualization: 'Yes',
        nominalVoltage: '12V',
        chemistry: 'Pb (Lead)',
        capacity: 100,
        temperatureCoefficient: -5,
        peukertExponent: 1.25,
        chargeEfficiencyFactor: 90
      }
    })
    tree.should.have.nested.property(
      'electrical.batteries.0.batteryType.value',
      'agm'
    )
    tree.should.have.nested.property(
      'electrical.batteries.0.supportsEqualization.value',
      true
    )
    tree.should.have.nested.property(
      'electrical.batteries.0.nominalVoltage.value',
      '12V'
    )
    tree.should.have.nested.property(
      'electrical.batteries.0.chemistry.value',
      'pb (lead)'
    )
    tree.should.have.nested.property(
      'electrical.batteries.0.capacity.nominal.value',
      360000
    )
    tree.should.have.nested.property(
      'electrical.batteries.0.temperatureCoefficient.value',
      -5
    )
    tree.should.have.nested.property(
      'electrical.batteries.0.peukertExponent.value',
      1.25
    )
    tree.should.have.nested.property(
      'electrical.batteries.0.chargeEfficiencyFactor.value',
      90
    )
  })

  it('no equalization battery', function () {
    var tree = require('./testMapper').toNested({
      timestamp: '2026-05-06T12:00:00.000Z',
      prio: 6,
      src: 35,
      dst: 255,
      pgn: 127513,
      description: 'Battery Configuration Status',
      fields: {
        instance: 1,
        batteryType: 'Flooded',
        supportsEqualization: 'No',
        nominalVoltage: '24V',
        chemistry: 'Li',
        capacity: 200,
        temperatureCoefficient: 0,
        peukertExponent: 1.05,
        chargeEfficiencyFactor: 95
      }
    })
    tree.should.have.nested.property(
      'electrical.batteries.1.batteryType.value',
      'flooded'
    )
    tree.should.have.nested.property(
      'electrical.batteries.1.supportsEqualization.value',
      false
    )
    tree.should.have.nested.property(
      'electrical.batteries.1.capacity.nominal.value',
      720000
    )
  })
})
