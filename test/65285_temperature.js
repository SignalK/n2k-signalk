var chai = require('chai')
chai.Should()
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('65285 Lowrance Temperature ', function () {
  it('complete sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp": "2015-01-15-16:25:14.120Z","prio": 0,"src": 5,"dst": 255,"pgn": 65285,"description": "Lowrance: Temperature","fields": {"Manufacturer Code":"Lowrance","Industry Code":"Marine Industry","Temperature Source":"Engine Room Temperature", "Actual Temperature": 25.60}}'
      )
    )
    tree.environment.inside.engineRoom.temperature.should.have.property(
      'value',
      25.6
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('converts livewell to a tank temperature', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp": "2015-01-15-16:25:14.120Z","prio": 0,"src": 5,"dst": 255,"pgn": 65285,"description": "Lowrance: Temperature","fields": {"Manufacturer Code":"Lowrance","Industry Code":"Marine Industry","Temperature Source":"Live Well Temperature", "Actual Temperature": 15.60}}'
      )
    )
    tree.tanks.liveWell.default.temperature.should.have.property('value', 15.6)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
