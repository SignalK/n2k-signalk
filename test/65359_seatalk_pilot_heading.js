var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('65359 Seatalk Pilot Heading', function () {
  it('complet magnetic sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:49.041Z","prio":7,"src":115,"dst":255,"pgn":65359,"description":"Seatalk: Pilot Heading","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Heading Magnetic":3.0422}}'
      )
    )
    tree.should.have.nested.property(
      'navigation.headingMagnetic.value',
      3.0422
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
  it('complet true sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:49.041Z","prio":7,"src":115,"dst":255,"pgn":65359,"description":"Seatalk: Pilot Heading","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Heading True":3.0422}}'
      )
    )
    tree.should.have.nested.property(
      'navigation.headingTrue.value',
      3.0422
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
