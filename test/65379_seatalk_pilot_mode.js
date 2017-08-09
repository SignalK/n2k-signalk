var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('65379 Seatalk Pilot Mode', function () {
  it('complet pilot mode sentence converts track', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:49.048Z","prio":7,"src":204,"dst":255,"pgn":65379,"description":"Seatalk: Pilot Mode","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Pilot Mode":"129","Sub Mode":"1","Pilot Mode Data":"0"}}'
      )
    )
    tree.should.have.nested.property('steering.autopilot.state.value', 'route')
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('complet pilot mode sentence converts auto', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-09-06T22:56:27.719Z","prio":7,"src":204,"dst":255,"pgn":65379,"description":"Seatalk: Pilot Mode","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Pilot Mode":"64","Sub Mode":"0","Pilot Mode Data":"0"}}'
      )
    )
    tree.should.have.nested.property('steering.autopilot.state.value', 'auto')
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('complet pilot mode sentence converts wind', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-09-06T23:01:38.822Z","prio":7,"src":204,"dst":255,"pgn":65379,"description":"Seatalk: Pilot Mode","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Pilot Mode":"0","Sub Mode":"1","Pilot Mode Data":"0"}}'
      )
    )
    tree.should.have.nested.property('steering.autopilot.state.value', 'wind')
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('complet pilot mode sentence converts standby', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:00.751Z","prio":7,"src":204,"dst":255,"pgn":65379,"description":"Seatalk: Pilot Mode","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Pilot Mode":"0","Sub Mode":"0","Pilot Mode Data":"0"}}'
      )
    )
    tree.should.have.nested.property(
      'steering.autopilot.state.value',
      'standby'
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
