import chai from 'chai'
import { FromPgn } from '@canboat/canboatjs'
chai.should()
chai.use(require('chai-things'))

// The Signal K schema has no electrical.switches, so these trees are not
// validated against it.
describe('127501 switch bank status', function () {
  // A Maretron SIM100 whose inputs all have an open or shorted wiring,
  // recorded from a live NMEA 2000 bus.
  function sim100InError() {
    const n2k = new FromPgn({ useCamel: true }).parseString(
      '2026-11-24T21:38:01.292Z,3,127501,110,255,8,d2,aa,fa,ff,ff,ff,ff,ff'
    )
    if (!n2k) {
      throw new Error('canboatjs does not decode the SIM100 frame')
    }
    return n2k
  }

  it('complete sentence converts', function () {
    const tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2017-08-12T15:51:46.369Z","prio":3,"src":32,"dst":255,"pgn":127501,"description":"Binary Switch Bank Status","fields":{"Instance":0,"Indicator1":"On","Indicator2":"Off","Indicator3":"On","Indicator4":"Off","Indicator5":"Off","Indicator6":"Off","Indicator7":"Off","list":[{}]}}'
      )
    )
    tree.should.have.nested.property(
      'electrical.switches.bank.0.1.state.value',
      1
    )
    tree.should.have.nested.property(
      'electrical.switches.bank.0.1.order.value',
      1
    )
    tree.should.have.nested.property(
      'electrical.switches.bank.0.2.state.value',
      0
    )
    tree.should.have.nested.property(
      'electrical.switches.bank.0.2.order.value',
      2
    )
    tree.should.have.nested.property(
      'electrical.switches.bank.0.3.state.value',
      1
    )
    tree.should.have.nested.property(
      'electrical.switches.bank.0.3.order.value',
      3
    )
    tree.should.have.nested.property(
      'electrical.switches.bank.0.4.state.value',
      0
    )
    tree.should.have.nested.property(
      'electrical.switches.bank.0.4.order.value',
      4
    )
    tree.should.have.nested.property(
      'electrical.switches.bank.0.5.state.value',
      0
    )
    tree.should.have.nested.property(
      'electrical.switches.bank.0.5.order.value',
      5
    )
    tree.should.have.nested.property(
      'electrical.switches.bank.0.6.state.value',
      0
    )
    tree.should.have.nested.property(
      'electrical.switches.bank.0.6.order.value',
      6
    )
    tree.should.have.nested.property(
      'electrical.switches.bank.0.7.state.value',
      0
    )
    tree.should.have.nested.property(
      'electrical.switches.bank.0.7.order.value',
      7
    )
    // tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('keeps an indicator in error apart from off', function () {
    const tree = require('./testMapper').n2kToNested(sim100InError())
    for (let i = 1; i <= 6; i++) {
      tree.should.have.nested.property(
        `electrical.switches.bank.210.${i}.state.value`,
        2
      )
    }
    // Indicators 7 to 28 are not available.
    tree.should.not.have.nested.property('electrical.switches.bank.210.7')
  })

  // The two frames as canboat decodes them when its OFF_ON lookup names
  // the error: a SIM100 with every input in error and one without.
  it('reads an error canboat names', function () {
    const mapper = require('./testMapper')
    const inError = mapper.n2kToNested(
      JSON.parse(
        '{"timestamp":"2026-11-24T21:38:01.292Z","prio":3,"src":110,"dst":255,"pgn":127501,"description":"Binary Switch Bank Status","fields":{"instance":210,"indicator1":"Error","indicator2":"Error","indicator3":"Error","indicator4":"Error","indicator5":"Error","indicator6":"Error"}}'
      )
    )
    inError.should.have.nested.property(
      'electrical.switches.bank.210.1.state.value',
      2
    )
    const working = mapper.n2kToNested(
      JSON.parse(
        '{"timestamp":"2026-11-24T21:38:05.548Z","prio":3,"src":237,"dst":255,"pgn":127501,"description":"Binary Switch Bank Status","fields":{"instance":215,"indicator1":"Off","indicator2":"Off","indicator3":"Off","indicator4":"Off","indicator5":"On","indicator6":"Off"}}'
      )
    )
    working.should.have.nested.property(
      'electrical.switches.bank.215.1.state.value',
      0
    )
    working.should.have.nested.property(
      'electrical.switches.bank.215.5.state.value',
      1
    )
  })

  it('reads an indicator given as a number and leaves out the rest', function () {
    // Set by hand, as no recording decodes to all of them: numbers, as a
    // decoder without the lookup's name gives them, null, and a key every
    // object inherits.
    const n2k = sim100InError()
    Object.assign(n2k.fields, {
      indicator1: 2,
      indicator2: 3,
      indicator3: null,
      indicator4: 1,
      indicator5: 0,
      indicator6: 'constructor'
    })
    const tree = require('./testMapper').n2kToNested(n2k)
    tree.should.have.nested.property(
      'electrical.switches.bank.210.1.state.value',
      2
    )
    tree.should.not.have.nested.property('electrical.switches.bank.210.2')
    tree.should.not.have.nested.property('electrical.switches.bank.210.3')
    tree.should.have.nested.property(
      'electrical.switches.bank.210.4.state.value',
      1
    )
    tree.should.have.nested.property(
      'electrical.switches.bank.210.5.state.value',
      0
    )
    tree.should.not.have.nested.property('electrical.switches.bank.210.6')
  })
})
