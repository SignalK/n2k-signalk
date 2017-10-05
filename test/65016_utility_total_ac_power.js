var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

describe('65016 Utility Total AC Power', function () {
  it('complete sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(`{
        "timestamp": "2017-10-05-13:52:41.000",
        "prio": 3,
        "src": 192,
        "dst": 255,
        "pgn": 65016,
        "description": "Utility Total AC Power",
        "fields": {
          "Real Power": 37888,
          "Apparent Power": 30517
        }
      }`)
    )

    tree.should.have.nested.property(
      'electrical.ac.utility.power.real.value',
      37888
    )

    tree.should.have.nested.property(
      'electrical.ac.utility.power.apparent.value',
      30517
    )

    // @FIXME
    // tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
