var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('126720 Seatalk-STNG-Converter Pilot Mode', function () {
  it('complet pilot mode sentence converts track', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:49.048Z","prio":7,"src":115,"dst":255,"pgn":126720,"description":"Seatalk1: Pilot Mode","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Pilot Mode":74,"Sub Mode":0,"Pilot Mode Data":"0","Proprietary ID":"Seatalk","command":"Pilot Mode"}}'
      )
    )
    tree.should.have.nested.property('steering.autopilot.state.value', 'route')
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('complet pilot mode sentence converts auto', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-09-06T22:56:27.719Z","prio":7,"src":115,"dst":255,"pgn":126720,"description":"Seatalk1: Pilot Mode","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Pilot Mode":"66","Sub Mode":"0","Pilot Mode Data":"0","Proprietary ID":"Seatalk","command":"Pilot Mode"}}'
      )
    )
    tree.should.have.nested.property('steering.autopilot.state.value', 'auto')
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('complet pilot mode sentence converts wind', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-09-06T23:01:38.822Z","prio":7,"src":115,"dst":255,"pgn":126720,"description":"Seatalk1: Pilot Mode","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Pilot Mode":"70","Sub Mode":"0","Pilot Mode Data":"0", "Proprietary ID":"Seatalk","command":"Pilot Mode"}}'
      )
    )
    tree.should.have.nested.property('steering.autopilot.state.value', 'wind')
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('complet pilot mode sentence converts standby', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:00.751Z","prio":7,"src":115,"dst":255,"pgn":126720,"description":"Seatalk1: Pilot Mode","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Pilot Mode":"0","Sub Mode":"0","Pilot Mode Data":"0","Proprietary ID":"Seatalk","command":"Pilot Mode"}}'
      )
    )
    tree.should.have.nested.property(
      'steering.autopilot.state.value',
      'standby'
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
