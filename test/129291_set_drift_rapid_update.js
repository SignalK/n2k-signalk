var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('129291 set & drift rapid update complete sentence', function () {
  var tree = require('./testMapper').toNested(
    JSON.parse(
      '{"timestamp":"2014-08-15-18:00:06.573Z","prio":"3","src":"160","dst":"255","pgn":"129291","description":"Set & Drift, Rapid Update","fields":{"Set Reference":"True","Set":"212.6","Drift":"0.24"}}'
    )
  )
  it('result has correct values', function () {
    tree.should.have.nested.property('environment.current.value.setTrue')
    tree.should.have.nested.property('environment.current.value.setTrue', 212.6)
    tree.should.have.nested.property('environment.current.value.drift')
    tree.should.have.nested.property('environment.current.value.drift', 0.24)
  })
  it('result is valid SignalK', function () {
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
