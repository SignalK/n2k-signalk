var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('127257_attitude', function () {
  it('complete sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2013-10-08-15:47:28.263Z","prio":"2","src":"204","dst":"255","pgn":"127257","description":"Attitude","fields":{"Yaw":1.9594,"Pitch":0.0267,"Roll":-0.0155}}'
      )
    )
    tree.should.have.nested.property('navigation.attitude.value.yaw', 1.9594)
    tree.should.have.nested.property('navigation.attitude.value.pitch', 0.0267)
    tree.should.have.nested.property('navigation.attitude.value.roll', -0.0155)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('leaves out an axis the sender does not measure', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2013-10-08-15:47:28.263Z","prio":"2","src":"204","dst":"255","pgn":"127257","description":"Attitude","fields":{"Pitch":-0.0037,"Roll":-0.0031}}'
      )
    )
    tree.should.have.nested.property('navigation.attitude.value.pitch', -0.0037)
    tree.should.have.nested.property('navigation.attitude.value.roll', -0.0031)
    tree.should.not.have.nested.property('navigation.attitude.value.yaw')
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('emits nothing when no axis is measured', function () {
    var delta = require('./testMapper').testToDelta(
      JSON.parse(
        '{"timestamp":"2013-10-08-15:47:28.263Z","prio":"2","src":"204","dst":"255","pgn":"127257","description":"Attitude","fields":{"SID":1}}'
      )
    )
    var values = delta.updates.flatMap(update => update.values)
    values
      .filter(pathValue => pathValue.path === 'navigation.attitude')
      .should.have.length(0)
  })
})
