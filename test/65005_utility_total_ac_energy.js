var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

describe('65005 Utility Total AC Energy', function () {
  it('complete sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(`{
        "timestamp": "2017-10-05-13:52:41.000",
        "prio": 3,
        "src": 192,
        "dst": 255,
        "pgn": 65005,
        "description": "Utility Total AC Energy",
        "fields": {
          "Total Energy Export": 10,
          "Total Energy Import": 10
        }
      }`)
    )
    tree.should.have.nested.property(
      'electrical.ac.utility.energyImport.value',
      36000000
    )
    tree.should.have.nested.property(
      'electrical.ac.utility.energyExport.value',
      36000000
    )
    // @TODO add to spec, then re-enable
    // tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
