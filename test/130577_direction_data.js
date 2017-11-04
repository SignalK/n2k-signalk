var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('130577 direction_data sentence without drift', function () {
  var tree = require('./testMapper').toNested(
    JSON.parse(
      '{"timestamp":"2014-08-15-10:01:35.236Z","prio":"3","src":"160","dst":"255","pgn":"130577","description":"Direction Data","fields":{"Data Mode":"Autonomous","COG Reference":"True","SID":"21","COG":"70.1","SOG":"0.01"}}'
    )
  )
  it('has correct values', function () {
    tree.should.have.nested.property('navigation.speedOverGround')
    tree.should.have.nested.property('navigation.speedOverGround.value', 0.01)
    tree.should.have.nested.property(
      'navigation.courseOverGroundTrue.value',
      70.1
    )
    tree.should.have.nested.property(
      'navigation.courseOverGroundTrue.value',
      70.1
    )
  })
  it('is valid SignalK', function () {
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})

describe('130577 direction_data sentence with drift', function () {
  var tree = require('./testMapper').toNested(
    JSON.parse(
      '{"timestamp":"2014-08-15-18:00:00.755Z","prio":"3","src":"160","dst":"255","pgn":"130577","description":"Direction Data","fields":{"Data Mode":"Autonomous","COG Reference":"True","SID":"84","COG":"206.9","SOG":"3.51","Set":"58.9","Drift":"0.28"}}'
    )
  )
  it('has correct values', function () {
    tree.should.have.nested.property('navigation.speedOverGround')
    tree.should.have.nested.property('navigation.speedOverGround.value', 3.51)
    tree.should.have.nested.property('navigation.courseOverGroundTrue')
    tree.should.have.nested.property(
      'navigation.courseOverGroundTrue.value',
      206.9
    )
    tree.should.have.nested.property('environment.current.value.setTrue', 58.9)
    tree.should.have.nested.property('environment.current.value.drift', 0.28)
  })
  it('is valid SignalK', function () {
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
