var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

state = {}

describe('127506 dc detailed status', function () {
  it('complete sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-08-22T16:02:55.272Z","prio":6,"src":17,"dst":255,"pgn":127506,"description":"DC Detailed Status","fields":{"DC Instance":1,"State of Charge":60,"State of Health":99,"Time Remaining": 600, "Ripple Voltage": 10.9, "SID":0}}'
      )
    )
    tree.should.have.nested.property(
      'electrical.batteries.1.capacity.stateOfCharge.value',
      0.6
    )
    tree.should.have.nested.property(
      'electrical.batteries.1.capacity.stateOfHealth.value',
      99
    )
    tree.should.have.nested.property(
      'electrical.batteries.1.capacity.timeRemaining.value',
      36000
    )
    // tree.should.have.nested.property('electrical.batteries.1.voltage.ripple.value', 10.9);
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
  it('null timeRemaining converts', function () {
    var pgn = '{"timestamp":"2016-08-22T16:02:55.272Z","prio":6,"src":17,"dst":255,"pgn":127506,"description":"DC Detailed Status","fields":{"DC Instance":1,"SID":0}}'
    var delta = require('../n2kMapper.js').toDelta(JSON.parse(pgn))
    tree = require('../n2kMapper.js').toNested(JSON.parse(pgn))
    delta.updates[0].values[0].should.have.property(
      'path',
      'electrical.batteries.1.capacity.timeRemaining'
    )
    delta.updates[0].values[0].should.have.property('value', null)
    tree.should.have.nested.property(
      'electrical.batteries.1.capacity.timeRemaining.value',
      null
    )
  })
})
