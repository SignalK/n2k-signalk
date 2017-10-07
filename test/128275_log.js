var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('128275 log', function () {
  it('complete sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2013-10-08-16:04:06.060Z","prio":"6","src":"1","dst":"255","pgn":"128275","description":"Distance Log","fields":{"Log":"2229808","Trip Log":"4074"}}'
      )
    )
    tree.should.have.nested.property('navigation.trip.log.value', 4074)
    tree.should.have.nested.property('navigation.log')
    tree.should.have.nested.property('navigation.log.value', 2229808)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
