var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('127257_attitude', function () {
  it('complete sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2013-10-08-15:47:28.263Z","prio":"2","src":"204","dst":"255","pgn":"127257","description":"Attitude","fields":{"Yaw":"37.190","Pitch":"0.464","Roll":"-2.496"}}'
      )
    )
    tree.should.have.nested.property('navigation.attitude.value.yaw', 37.19)
    tree.should.have.nested.property('navigation.attitude.value.pitch', 0.464)
    tree.should.have.nested.property('navigation.attitude.value.roll', -2.496)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
