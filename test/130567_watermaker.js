var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('130567 watermaker input setting and status', function () {
  it('complete sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2026-07-16T12:00:00.000Z","prio":6,"src":22,"dst":255,"pgn":130567,"description":"Watermaker Input Setting and Status","fields":{"watermakerOperatingState":"Running","productionStartStop":"Yes","rinseStartStop":"No","lowPressurePumpStatus":"Yes","highPressurePumpStatus":"Yes","emergencyStop":"No","productSolenoidValveStatus":"OK","flushModeStatus":"No","salinityStatus":"OK","sensorStatus":"OK","oilChangeIndicatorStatus":"OK","filterStatus":"Warning","systemStatus":"OK","salinity":320,"productWaterTemperature":300.15,"preFilterPressure":100000,"postFilterPressure":98000,"feedPressure":100000,"systemHighPressure":5500000,"productWaterFlow":360,"brineWaterFlow":1800,"runTime":123456}}'
      )
    )
    tree.should.have.nested.property('watermaker.0.state.value', 'Running')
    tree.should.have.nested.property('watermaker.0.production.value', true)
    tree.should.have.nested.property('watermaker.0.rinsing.value', false)
    tree.should.have.nested.property('watermaker.0.lowPressurePump.value', true)
    tree.should.have.nested.property(
      'watermaker.0.highPressurePump.value',
      true
    )
    tree.should.have.nested.property('watermaker.0.emergencyStop.value', false)
    tree.should.have.nested.property('watermaker.0.flushMode.value', false)
    tree.should.have.nested.property('watermaker.0.salinity.value', 0.00032)
    tree.watermaker['0'].productWaterTemperature.value.should.be.closeTo(
      300.15,
      0.001
    )
    tree.should.have.nested.property(
      'watermaker.0.preFilterPressure.value',
      100000
    )
    tree.should.have.nested.property(
      'watermaker.0.postFilterPressure.value',
      98000
    )
    tree.should.have.nested.property('watermaker.0.feedPressure.value', 100000)
    tree.should.have.nested.property(
      'watermaker.0.systemHighPressure.value',
      5500000
    )
    tree.should.have.nested.property(
      'watermaker.0.productWaterFlow.value',
      0.0001
    )
    tree.should.have.nested.property(
      'watermaker.0.brineWaterFlow.value',
      0.0005
    )
    tree.should.have.nested.property('watermaker.0.runTime.value', 123456)
    tree.should.have.nested.property(
      'notifications.watermaker.0.filter.value.state',
      'alert'
    )
    tree.should.have.nested.property(
      'notifications.watermaker.0.system.value.state',
      'normal'
    )
    tree.should.have.nested.property(
      'notifications.watermaker.0.emergencyStop.value.state',
      'normal'
    )
    // no schema validation: the spec has no watermaker branch (yet)
  })

  it('undefined fields produce no values', function () {
    var delta = require('./testMapper').testToDelta(
      JSON.parse(
        '{"timestamp":"2026-07-16T12:00:00.000Z","prio":6,"src":22,"dst":255,"pgn":130567,"description":"Watermaker Input Setting and Status","fields":{"watermakerOperatingState":"Stopped"}}'
      )
    )
    var paths = delta.updates[0].values.map(v => v.path)
    paths.should.include('watermaker.0.state')
    paths.should.not.include('watermaker.0.production')
    paths.should.not.include('watermaker.0.salinity')
    paths.should.not.include('notifications.watermaker.0.filter')
  })
})
