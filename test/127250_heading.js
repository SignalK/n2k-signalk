var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('127250 Heading', function () {
  it('Magnetic sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2013-10-08-15:47:28.263Z","prio":"2","src":"204","dst":"255","pgn":"127250","description":"Vessel Heading","fields":{"Heading":1.7447,"Reference":"Magnetic"}}'
      )
    )
    tree.should.have.with.nested.property(
      'navigation.headingMagnetic.value',
      1.7447
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('Variation sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2013-10-08-15:47:28.264Z","prio":"2","src":"1","dst":"255","pgn":"127250","description":"Vessel Heading","fields":{"SID":"68","Variation":-0.1956, "Reference":"True"}}'
      )
    )
    tree.should.have.with.nested.property(
      'navigation.magneticVariation.value',
      -0.1956
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('True heading sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-04-14T09:34:11.275Z","prio":2,"src":2,"dst":255,"pgn":127250,"description":"Vessel Heading","fields":{"Heading":1.871,"Variation":0.0,"Reference":"True"}}'
      )
    )
    tree.should.have.with.nested.property('navigation.headingTrue.value', 1.871)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('Deviation sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-04-14T09:34:11.275Z","prio":2,"src":2,"dst":255,"pgn":127250,"description":"Vessel Heading","fields":{"Heading":14.8,"Deviation":0.1,"Variation":0.0,"Reference":"True"}}'
      )
    )
    tree.should.have.with.nested.property(
      'navigation.magneticDeviation.value',
      0.1
    )
    // tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('Cetrek sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"canId":233902663,"prio":3,"src":71,"dst":255,"pgn":127250,"timestamp":"2022-12-11T14:48:31.783Z","fields":{"Heading":6.2657},"description":"Vessel Heading"}'
      )
    )
    tree.should.have.with.nested.property(
      'navigation.headingTrue.value',
      6.2657
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
