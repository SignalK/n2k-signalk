var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

function dm1 (fields) {
  return require('./testMapper').n2kToNested({
    timestamp: '2023-12-10T18:58:21.487Z',
    prio: 6,
    src: 0,
    dst: 255,
    pgn: 65226,
    description: 'Active Trouble Codes',
    fields
  })
}

const LAMPS_OFF = {
  protectLampStatus: 'Off',
  amberWarningLampStatus: 'Off',
  redStopLampStatus: 'Off',
  malfunctionIndicatorLampStatus: 'Off'
}

describe('65226 J1939 active trouble codes', function () {
  it('a no-fault DM1 maps to a normal notification', function () {
    // Yamaha outboard, 18FECA00 [8] 00 FF 00 00 00 00 FF FF, in canboat's
    // J1939-73 decode (canboat analyzer/tests/j1939-pgn-test)
    var tree = dm1({
      ...LAMPS_OFF,
      list: [{ spn: 0, fmi: 0, oc: 0, cm: 0 }, {}]
    })
    var value = tree.notifications.propulsion['0'].troubleCodes.value
    value.state.should.equal('normal')
    value.method.should.deep.equal([])
    value.message.should.equal('No active trouble codes')
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('the same frame in the decode before canboat#949 is not mapped', function () {
    // as @canboat/wasm 8.4.0 decodes the Yamaha frame above
    var tree = dm1({
      malfunctionLampStatus: '00',
      redStopLampStatus: '00',
      amberWarningLampStatus: '00',
      protectLampStatus: '00',
      list: [
        { spn: '00 00 00', fmi: '00', cm: '00', oc: '00' },
        { spn: 'FF FF' }
      ]
    })
    tree.should.not.have.nested.property('notifications.propulsion')
  })

  it('malfunction indicator lamp maps to a warning, a named SPN by name', function () {
    // 40 FF 64 00 01 03: malfunction indicator On, SPN 100 FMI 1 OC 3
    // (canboat analyzer/tests/j1939-scaling)
    var tree = dm1({
      ...LAMPS_OFF,
      malfunctionIndicatorLampStatus: 'On',
      list: [{ spn: 'Engine Oil Pressure', fmi: 1, oc: 3, cm: 0 }]
    })
    var value = tree.notifications.propulsion['0'].troubleCodes.value
    value.state.should.equal('warn')
    value.message.should.equal(
      'malfunction lamp; 1 trouble code: Engine Oil Pressure FMI 1'
    )
    value.method.should.deep.equal(['visual', 'sound'])
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('a DTC with every lamp off is still an alert', function () {
    // 00 FF 00 F0 E2 05: SPN 520192 FMI 2 OC 5 (canboat j1939-scaling)
    var tree = dm1({
      ...LAMPS_OFF,
      list: [{ spn: 520192, fmi: 2, oc: 5, cm: 0 }]
    })
    var value = tree.notifications.propulsion['0'].troubleCodes.value
    value.state.should.equal('alert')
    value.message.should.equal('1 trouble code: SPN 520192 FMI 2')
    value.method.should.deep.equal(['visual', 'sound'])
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('red stop lamp maps to an alarm', function () {
    var tree = dm1({
      ...LAMPS_OFF,
      redStopLampStatus: 'On',
      list: [{ spn: 520192, fmi: 2, oc: 5, cm: 0 }]
    })
    var value = tree.notifications.propulsion['0'].troubleCodes.value
    value.state.should.equal('alarm')
    value.message.should.equal(
      'red stop lamp; 1 trouble code: SPN 520192 FMI 2'
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('a lamp in Error or not available is not lit', function () {
    // not available (3) is omitted by the decoder
    var tree = dm1({
      protectLampStatus: 'Off',
      redStopLampStatus: 'Error',
      list: [{ spn: 0, fmi: 0, oc: 0, cm: 0 }]
    })
    var value = tree.notifications.propulsion['0'].troubleCodes.value
    value.state.should.equal('normal')
    value.message.should.equal('No active trouble codes')
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('an SPN in the older conversion method is not shown', function () {
    var tree = dm1({
      ...LAMPS_OFF,
      list: [{ spn: 520192, fmi: 2, oc: 5, cm: 1 }]
    })
    var value = tree.notifications.propulsion['0'].troubleCodes.value
    value.state.should.equal('alert')
    value.message.should.equal('1 trouble code: FMI 2 (SPN in an older layout)')
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
