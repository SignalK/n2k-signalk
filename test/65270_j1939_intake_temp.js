var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('65270 J1939 inlet/exhaust conditions', function () {
  it('intake manifold temperature converts (Kelvin)', function () {
    // Yamaha outboard, 18FEF600 [8] FF FF 3D 32 FF FF FF FF (21 °C), as
    // @canboat/wasm 8.4.0 decodes it with j1939 on
    var tree = require('./testMapper').n2kToNested(
      JSON.parse(
        '{"timestamp":"2023-12-10T18:58:21.487Z","prio":6,"src":0,"dst":255,"pgn":65270,"description":"Inlet/Exhaust Conditions","fields":{"intakeManifoldTemp":294,"airInletPressure":100000}}'
      )
    )
    tree.should.have.nested.property(
      'propulsion.0.intakeManifoldTemperature.value',
      294
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
