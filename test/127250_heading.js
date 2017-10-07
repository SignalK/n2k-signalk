var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('127250 Heading', function () {
  it('Magnetic sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2013-10-08-15:47:28.263Z","prio":"2","src":"204","dst":"255","pgn":"127250","description":"Vessel Heading","fields":{"Heading":"129.7","Reference":"Magnetic"}}'
      )
    )
    tree.should.have.with.nested.property(
      'navigation.headingMagnetic.value',
      129.7
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('Variation sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2013-10-08-15:47:28.264Z","prio":"2","src":"1","dst":"255","pgn":"127250","description":"Vessel Heading","fields":{"SID":"68","Variation":"8.0","Reference":"True"}}'
      )
    )
    tree.should.have.with.nested.property(
      'navigation.magneticVariation.value',
      8
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('True heading sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-04-14T09:34:11.275Z","prio":2,"src":2,"dst":255,"pgn":127250,"description":"Vessel Heading","fields":{"Heading":14.8,"Deviation":0.0,"Variation":0.0,"Reference":"True"}}'
      )
    )
    tree.should.have.with.nested.property('navigation.headingTrue.value', 14.8)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
