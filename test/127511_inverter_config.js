var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

// PGN 127511 has the same bit-packing bug in canboatjs as 127509/127510,
// so bypass the roundtrip.
process.env.NO_CANBOATJS = 'true'

describe('127511 inverter configuration status', function () {
  it('converts fields to signalk paths', function () {
    var tree = require('./testMapper').toNested({
      timestamp: '2026-05-06T12:00:00.000Z',
      prio: 6,
      src: 35,
      dst: 255,
      pgn: 127511,
      description: 'Inverter Configuration Status',
      fields: {
        instance: 0,
        acInstance: 0,
        dcInstance: 0,
        inverterEnableDisable: 'On',
        inverterMode: 'Standalone',
        loadSenseEnableDisable: 'On',
        loadSensePowerThreshold: 50,
        loadSenseInterval: 5.0
      }
    })
    tree.should.have.nested.property(
      'electrical.inverters.0.enabled.value',
      true
    )
    tree.should.have.nested.property(
      'electrical.inverters.0.inverterMode.value',
      'standalone'
    )
    tree.should.have.nested.property(
      'electrical.inverters.0.loadSenseEnabled.value',
      true
    )
    tree.should.have.nested.property(
      'electrical.inverters.0.loadSensePowerThreshold.value',
      50
    )
    tree.should.have.nested.property(
      'electrical.inverters.0.loadSenseInterval.value',
      5.0
    )
  })

  it('disabled inverter converts', function () {
    var tree = require('./testMapper').toNested({
      timestamp: '2026-05-06T12:00:00.000Z',
      prio: 6,
      src: 35,
      dst: 255,
      pgn: 127511,
      description: 'Inverter Configuration Status',
      fields: {
        instance: 1,
        acInstance: 0,
        dcInstance: 0,
        inverterEnableDisable: 'Off',
        inverterMode: 'Parallel Master',
        loadSenseEnableDisable: 'Off',
        loadSensePowerThreshold: 0,
        loadSenseInterval: 0
      }
    })
    tree.should.have.nested.property(
      'electrical.inverters.1.enabled.value',
      false
    )
    tree.should.have.nested.property(
      'electrical.inverters.1.inverterMode.value',
      'parallel master'
    )
    tree.should.have.nested.property(
      'electrical.inverters.1.loadSenseEnabled.value',
      false
    )
  })
})
