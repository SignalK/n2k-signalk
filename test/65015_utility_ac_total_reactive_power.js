var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

describe('65015 Utility Total AC Reactive Power', function () {
  it('complete sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(`{
        "timestamp": "2017-10-05-13:52:41.000",
        "prio": 3,
        "src": 192,
        "dst": 255,
        "pgn": 65015,
        "description": "Utility Total AC Reactive Power",
        "fields": {
          "Reactive Power": 37888,
          "Power Factor": 0,
          "Power Factor Lagging": 1
        }
      }`)
    )

    tree.should.have.nested.property(
      'electrical.ac.utility.reactivePower.value',
      37888
    )

    tree.should.have.nested.property(
      'electrical.ac.utility.powerFactor.value',
      0
    )

    tree.should.have.nested.property(
      'electrical.ac.utility.powerFactorLagging.value',
      'lagging'
    )

    // @FIXME
    // tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
