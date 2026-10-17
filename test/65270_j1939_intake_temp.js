var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('65270 J1939 inlet/exhaust conditions', function () {
  it('intake manifold temperature converts (Kelvin), engine id from source address', function () {
    // 18FEF601 [8] FF FF 50 FF FF FF FF FF: 80 - 40 = 40 °C, as decoded
    // by @canboat/wasm 8.4.0 with j1939 on
    var tree = require('./testMapper').n2kToNested(
      JSON.parse(
        '{"timestamp":"2026-08-06T00:00:00.000Z","prio":6,"src":1,"dst":255,"pgn":65270,"description":"Inlet/Exhaust Conditions","fields":{"intakeManifoldTemp":313}}'
      )
    )
    tree.should.have.nested.property(
      'propulsion.1.intakeManifoldTemperature.value',
      313
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
