var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('65262 J1939 engine temp', function () {
  it('coolant temperature converts (Kelvin)', function () {
    var tree = require('./testMapper').n2kToNested(
      JSON.parse(
        '{"timestamp":"2026-08-06T00:00:00.000Z","prio":6,"src":0,"dst":255,"pgn":65262,"description":"Engine Temp #1","fields":{"engineCoolantTemp":323.15}}'
      )
    )
    tree.should.have.nested.property('propulsion.0.coolantTemperature')
    tree.should.have.nested.property(
      'propulsion.0.coolantTemperature.value',
      323.15
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
