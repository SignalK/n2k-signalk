import chai from 'chai'
chai.should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('129291 set & drift rapid update complete sentence', function () {
  const tree = require('./testMapper').toNested(
    JSON.parse(
      '{"timestamp":"2014-08-15-18:00:06.573Z","prio":"3","src":"160","dst":"255","pgn":"129291","description":"Set & Drift, Rapid Update","fields":{"Set Reference":"True","Set":2.126,"Drift":0.24}}'
    )
  )
  it('result has correct values', function () {
    tree.should.have.nested.property('environment.current.value.setTrue')
    tree.should.have.nested.property('environment.current.value.setTrue', 2.126)
    tree.should.have.nested.property('environment.current.value.drift')
    tree.should.have.nested.property('environment.current.value.drift', 0.24)
  })
  it('result is valid SignalK', function () {
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})

describe('129291 set & drift with a magnetic set reference', function () {
  // No capture with a magnetic reference is available.
  const tree = require('./testMapper').toNested(
    JSON.parse(
      '{"timestamp":"2014-08-15-18:00:06.573Z","prio":"3","src":"160","dst":"255","pgn":"129291","description":"Set & Drift, Rapid Update","fields":{"Set Reference":"Magnetic","Set":2.126,"Drift":0.24}}'
    )
  )
  it('writes the set as setMagnetic', function () {
    tree.should.have.nested.property(
      'environment.current.value.setMagnetic',
      2.126
    )
    tree.should.not.have.nested.property('environment.current.value.setTrue')
    tree.should.have.nested.property('environment.current.value.drift', 0.24)
  })
  it('result is valid SignalK', function () {
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
