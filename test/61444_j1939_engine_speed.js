var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('61444 J1939 EEC1 engine speed', function () {
  it('engine rpm converts, engine id from source address', function () {
    // Yamaha outboard, 0CF00400 [8] FF FF FF 8A 03 FF FF FF, as
    // @canboat/wasm 8.4.0 decodes it with j1939 on
    var tree = require('./testMapper').n2kToNested(
      JSON.parse(
        '{"timestamp":"2023-12-10T18:58:21.487Z","prio":3,"src":0,"dst":255,"pgn":61444,"description":"ECU #1","fields":{"driversDemandEnginePercentTorque":-1,"actualEnginePercentTorque":-1,"engineRpm":113.2,"engineDemandPercentTorque":-1}}'
      )
    )
    tree.should.have.nested.property(
      'propulsion.0.revolutions.value',
      113.2 / 60.0
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('an engine speed that is not a number is not mapped', function () {
    ;[undefined, null, 'unavailable', NaN].forEach(function (engineRpm) {
      var tree = require('./testMapper').n2kToNested({
        timestamp: '2023-12-10T18:58:21.487Z',
        prio: 3,
        src: 0,
        dst: 255,
        pgn: 61444,
        description: 'ECU #1',
        fields: { engineRpm }
      })
      tree.should.not.have.nested.property('propulsion.0.revolutions')
    })
  })
})
