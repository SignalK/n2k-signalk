var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

describe('65030 Generator Average Basic AC Quantities', function () {
  it('complete sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(`{
        "timestamp": "2017-10-05-13:52:41.000",
        "prio": 3,
        "src": 192,
        "dst": 255,
        "pgn": 65030,
        "description": "Generator Average Basic AC Quantities",
        "fields": {
          "Line-Line AC RMS Voltage": 0,
          "Line-Neutral AC RMS Voltage": 0,
          "AC RMS Current": 0,
          "AC Frequency": 0
        }
      }`)
    )

    tree.should.have.nested.property(
      'electrical.ac.generator.rmsVoltage.lineLine.value',
      0
    )

    tree.should.have.nested.property(
      'electrical.ac.generator.rmsVoltage.lineNeutral.value',
      0
    )

    tree.should.have.nested.property(
      'electrical.ac.generator.rmsVoltage.current.value',
      0
    )

    tree.should.have.nested.property(
      'electrical.ac.generator.frequency.value',
      0
    )

    // @FIXME
    // tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
