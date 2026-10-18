var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('65379 Seatalk Pilot Mode', function () {
  it('complet pilot mode sentence converts track', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:49.048Z","prio":7,"src":204,"dst":255,"pgn":65379,"description":"Seatalk: Pilot Mode","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Pilot Mode":"Track Mode","Sub Mode":"0","Pilot Mode Data":"0"}}'
      )
    )
    tree.should.have.nested.property('steering.autopilot.state.value', 'route')
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('complet pilot mode sentence converts auto', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-09-06T22:56:27.719Z","prio":7,"src":204,"dst":255,"pgn":65379,"description":"Seatalk: Pilot Mode","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Pilot Mode":"Auto, compass commanded","Sub Mode":"0","Pilot Mode Data":"0"}}'
      )
    )
    tree.should.have.nested.property('steering.autopilot.state.value', 'auto')
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('complet pilot mode sentence converts wind', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-09-06T23:01:38.822Z","prio":7,"src":204,"dst":255,"pgn":65379,"description":"Seatalk: Pilot Mode","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Pilot Mode":"Vane, Wind Mode","Sub Mode":"0","Pilot Mode Data":"0"}}'
      )
    )
    tree.should.have.nested.property('steering.autopilot.state.value', 'wind')
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('complet pilot mode sentence converts standby', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:00.751Z","prio":7,"src":204,"dst":255,"pgn":65379,"description":"Seatalk: Pilot Mode","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Pilot Mode":"Standby","Sub Mode":"0","Pilot Mode Data":"0"}}'
      )
    )
    tree.should.have.nested.property(
      'steering.autopilot.state.value',
      'standby'
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  // canboatjs decodes another manufacturer's 65379 with the catch-all of
  // the proprietary range: only manufacturerCode, industryCode and data.
  it("ignores another manufacturer's message", function () {
    var delta = require('./testMapper').toDelta({
      timestamp: '2026-10-18T12:00:00.000Z',
      prio: 7,
      src: 3,
      dst: 255,
      pgn: 65379,
      fields: {
        manufacturerCode: 'Garmin',
        industryCode: 'Marine Industry',
        data: '0102030405'
      }
    })
    var values = delta.updates.flatMap(update => update.values)
    values
      .filter(pathValue => pathValue.path === 'steering.autopilot.state')
      .should.have.length(0)
  })
})
