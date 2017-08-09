var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('65360 Seatalk Pilot Locked Heading', function () {
  it('complet wind datum sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:49.041Z","prio":7,"src":204,"dst":255,"pgn":65360,"description":"Seatalk: Pilot Locked Heading","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Target Heading True":3.0422,"Target Heading Magnetic":3.0122}}'
      )
    )
    tree.should.have.nested.property(
      'steering.autopilot.target.headingTrue.value',
      3.0422
    )
    tree.should.have.nested.property(
      'steering.autopilot.target.headingMagnetic.value',
      3.0122
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
  it('complet wind datum sentence converts mag', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:49.041Z","prio":7,"src":204,"dst":255,"pgn":65360,"description":"Seatalk: Pilot Locked Heading","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Target Heading Magnetic":3.0422}}'
      )
    )
    tree.should.have.nested.property(
      'steering.autopilot.target.headingMagnetic.value',
      3.0422
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
  it('complet wind datum sentence converts true', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:49.041Z","prio":7,"src":204,"dst":255,"pgn":65360,"description":"Seatalk: Pilot Locked Heading","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Target Heading True":3.0422}}'
      )
    )
    tree.should.have.nested.property(
      'steering.autopilot.target.headingTrue.value',
      3.0422
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
