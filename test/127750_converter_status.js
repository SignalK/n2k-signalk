var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

describe('127750 converter status', function () {
  it('complete sentence converts', function () {
    var tree = require('./testMapper').toNested({
      timestamp: '2016-11-26T20:40:00.895Z',
      prio: 7,
      src: 10,
      dst: 255,
      pgn: 127750,
      description: 'Converter Status',
      fields: {
        'Connection Number': 1,
        'Operating State': 'Absorption',
        'Temperature State': 'Warning',
        'Overload State': 'Error',
        'Low DC Voltage State': 'Error',
        'Ripple State': 'Error'
      }
    })
    tree.should.have.nested.property(
      'electrical.converter.10.1.operatingState.value',
      'absorption'
    )
    tree.should.have.nested.property(
      'electrical.converter.10.1.temperatureState.value',
      'warning'
    )
    tree.should.have.nested.property(
      'electrical.converter.10.1.overloadState.value',
      'error'
    )
    tree.should.have.nested.property(
      'electrical.converter.10.1.lowDCVoltageState.value',
      'error'
    )
    tree.should.have.nested.property(
      'electrical.converter.10.1.rippleState.value',
      'error'
    )
  })

  it('unknown states convert', function () {
    var tree = require('./testMapper').toNested({
      timestamp: '2016-11-26T20:40:00.895Z',
      prio: 7,
      src: 10,
      dst: 255,
      pgn: 127750,
      description: 'Converter Status',
      fields: {
        'Connection Number': 100,
        'Operating State': 100,
        'Temperature State': 100,
        'Overload State': 100,
        'Low DC Voltage State': 'DC voltage too low',
        'Ripple State': 'Ripple Too High'
      }
    })
    tree.should.not.have.nested.property(
      'electrical.converter.10.1.operatingState.value'
    )
    tree.should.not.have.nested.property(
      'electrical.converter.10.1.temperatureState.value'
    )
    tree.should.not.have.nested.property(
      'electrical.converter.10.1.overloadState.value'
    )
    tree.should.not.have.nested.property(
      'electrical.converter.10.1.lowDCVoltageState.value'
    )
    tree.should.not.have.nested.property(
      'electrical.converter.10.1.rippleState.value'
    )
  })
})
