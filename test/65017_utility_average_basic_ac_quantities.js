var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

describe('65017 Utility Average Basic AC Quantities', function () {
  it('complete sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(`{
        "timestamp": "2017-10-05-13:52:41.000",
        "prio": 3,
        "src": 192,
        "dst": 255,
        "pgn": 65017,
        "description": "Utility Average Basic AC Quantities",
        "fields": {
          "Line-Line AC RMS Voltage": 0,
          "Line-Neutral AC RMS Voltage": 0,
          "AC RMS Current": 0,
          "AC Frequency": 0
        }
      }`)
    )

    tree.should.have.nested.property(
      'electrical.ac.utility.rmsVoltage.lineLine.value',
      0
    )

    tree.should.have.nested.property(
      'electrical.ac.utility.rmsVoltage.lineNeutral.value',
      0
    )

    tree.should.have.nested.property(
      'electrical.ac.utility.rmsVoltage.current.value',
      0
    )

    tree.should.have.nested.property(
      'electrical.ac.utility.frequency.value',
      0
    )

    // @FIXME
    // tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
