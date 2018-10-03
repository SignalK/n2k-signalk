var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('127508 battery voltage', function () {
  it('complete sentence converts', function () {
    const json = '{"timestamp":"2016-08-22T16:02:55.272Z","prio":6,"src":17,"dst":255,"pgn":127508,"description":"Battery Status","fields":{"Battery Instance":1,"Voltage":13.11,"Current":5.6,"Temperature": 299, "SID":0}}'
    const pgns = [ json, json.replace('Battery Instance', 'Instance') ]
    pgns.forEach(pgn => {
    var tree = require('./testMapper').toNested(
      JSON.parse(pgn)
    )
    tree.should.have.nested.property(
      'electrical.batteries.1.voltage.value',
      13.11
    )
    tree.should.have.nested.property(
      'electrical.batteries.1.current.value',
      5.6
    )
    tree.should.have.nested.property(
      'electrical.batteries.1.temperature.value',
      299
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
    })
  })
})
