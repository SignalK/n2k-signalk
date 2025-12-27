var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

function generatePGNs (json) {
  return [json.replace('DC Instance', 'Instance')]
}
describe('127506 dc detailed status', function () {
  it('complete sentence converts', function () {
    generatePGNs(
      '{"timestamp":"2016-08-22T16:02:55.272Z","prio":6,"src":17,"dst":255,"pgn":127506,"description":"DC Detailed Status","fields":{"Instance":1,"State of Charge":60,"State of Health":99,"Time Remaining": "00:30:00", "Ripple Voltage": 10.9, "SID":0}}'
    ).forEach(pgn => {
      var tree = require('./testMapper').toNested(JSON.parse(pgn))
      tree.should.have.nested.property(
        'electrical.batteries.1.capacity.stateOfCharge.value',
        0.6
      )
      tree.should.have.nested.property(
        'electrical.batteries.1.capacity.stateOfHealth.value',
        0.99
      )
      tree.should.have.nested.property(
        'electrical.batteries.1.capacity.timeRemaining.value',
        1800
      )
      // tree.should.have.nested.property('electrical.batteries.1.voltage.ripple.value', 10.9);
      tree.should.be.validSignalKVesselIgnoringIdentity
    })
  })
  it('stateOfHealth percentage converts to ratio', function () {
    // Canboat output: stateOfHealth is a percentage (0-100)
    // SignalK expects: ratio (0-1) per schema definition ("State of Health, 1 = 100%")
    var canboatInput = {
      pgn: 127506,
      prio: 6,
      src: 224,
      dst: 255,
      timestamp: '2026-01-01T01:12:26.703Z',
      description: 'DC Detailed Status',
      fields: {
        sid: 86,
        instance: 0,
        dcType: 'Battery',
        stateOfCharge: 87,
        stateOfHealth: 88,
        timeRemaining: null,
        rippleVoltage: null,
        remainingCapacity: null
      },
      id: 'dcDetailedStatus'
    }
    var delta = require('./testMapper').testToDelta(canboatInput)
    var stateOfHealthValue = delta.updates[0].values.find(
      v => v.path === 'electrical.batteries.0.capacity.stateOfHealth'
    )
    stateOfHealthValue.value.should.equal(0.88)
    var stateOfChargeValue = delta.updates[0].values.find(
      v => v.path === 'electrical.batteries.0.capacity.stateOfCharge'
    )
    stateOfChargeValue.value.should.equal(0.87)
  })
  it('null timeRemaining converts', function () {
    generatePGNs(
      '{"timestamp":"2016-08-22T16:02:55.272Z","prio":6,"src":17,"dst":255,"pgn":127506,"description":"DC Detailed Status","fields":{"instance":1,"SID":0}}'
    ).forEach(pgn => {
      var delta = require('./testMapper').testToDelta(JSON.parse(pgn))
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
