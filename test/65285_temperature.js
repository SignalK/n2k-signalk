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
      'timestamp',
      '2015-01-15T16:25:14.120Z'
    )
    tree.environment.inside.engineRoom.temperature.should.have.property('value', 25.60)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
