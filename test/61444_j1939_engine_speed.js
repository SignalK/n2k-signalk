var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('61444 J1939 EEC1 engine speed', function () {
  it('engine rpm converts, engine id from source address', function () {
    var tree = require('./testMapper').n2kToNested(
      JSON.parse(
        '{"timestamp":"2026-08-06T00:00:00.000Z","prio":3,"src":0,"dst":255,"pgn":61444,"description":"ECU #1","fields":{"engineRpm":113.2}}'
      )
    )
    tree.should.have.nested.property('propulsion.0.revolutions')
    tree.should.have.nested.property(
      'propulsion.0.revolutions.value',
      113.2 / 60.0
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
