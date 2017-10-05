var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

describe('65030 Generator Average Basic AC Quantities', function () {
  it('complete sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2017-10-05-13:52:41.000","prio":3,"src":192,"dst":255,"pgn":65030,"description":"Generator Average Basic AC Quantities","fields":{"Line-Line AC RMS Voltage":0,"Line-Neutral AC RMS Voltage":0,"AC RMS Current":0}}'
      )
    )
    tree.should.have.nested.property(
      'navigation.datetime.value',
      '2013-10-08T16:04:00Z'
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
