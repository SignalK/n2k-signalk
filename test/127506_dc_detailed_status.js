var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

function generatePGNs(json) {
  return [ json, json.replace('DC Instance', 'Instance') ]
}
describe('127506 dc detailed status', function () {
  it('complete sentence converts', function () {
    generatePGNs('{"timestamp":"2016-08-22T16:02:55.272Z","prio":6,"src":17,"dst":255,"pgn":127506,"description":"DC Detailed Status","fields":{"DC Instance":1,"State of Charge":60,"State of Health":99,"Time Remaining": 600, "Ripple Voltage": 10.9, "SID":0}}')
    .forEach(pgn => {
    var tree = require('./testMapper').toNested(
      JSON.parse(pgn)
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
  })
  it('null timeRemaining converts', function () {
    generatePGNs('{"timestamp":"2016-08-22T16:02:55.272Z","prio":6,"src":17,"dst":255,"pgn":127506,"description":"DC Detailed Status","fields":{"DC Instance":1,"SID":0}}')
    .forEach(pgn => {
    var delta = require('./testMapper').toDelta(JSON.parse(pgn))
    tree = require('./testMapper').toNested(JSON.parse(pgn))

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
})
