var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

describe('127501 switch bank status', function () {
  it('complete sentence converts', function () {
    var tree = require('./testMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2017-08-12T15:51:46.369Z","prio":3,"src":32,"dst":255,"pgn":127501,"description":"Binary Switch Bank Status","fields":{"Instance":0,"Indicator1":"On","Indicator2":"Off","Indicator3":"On","Indicator4":"Off","Indicator5":"Off","Indicator6":"Off","Indicator7":"Off","list":[{}]}}'
      )
    )
    tree.should.have.nested.property('electrical.switches.bank.0.1.state.value', 1)
    tree.should.have.nested.property('electrical.switches.bank.0.1.order.value', 1)
    tree.should.have.nested.property('electrical.switches.bank.0.2.state.value', 0)
    tree.should.have.nested.property('electrical.switches.bank.0.2.order.value', 2)
    tree.should.have.nested.property('electrical.switches.bank.0.3.state.value', 1)
    tree.should.have.nested.property('electrical.switches.bank.0.3.order.value', 3)
    tree.should.have.nested.property('electrical.switches.bank.0.4.state.value', 0)
    tree.should.have.nested.property('electrical.switches.bank.0.4.order.value', 4)
    tree.should.have.nested.property('electrical.switches.bank.0.5.state.value', 0)
    tree.should.have.nested.property('electrical.switches.bank.0.5.order.value', 5)
    tree.should.have.nested.property('electrical.switches.bank.0.6.state.value', 0)
    tree.should.have.nested.property('electrical.switches.bank.0.6.order.value', 6)
    tree.should.have.nested.property('electrical.switches.bank.0.7.state.value', 0)
    tree.should.have.nested.property('electrical.switches.bank.0.7.order.value', 7)
    // tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
