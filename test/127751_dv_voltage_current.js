var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

describe('127750 converter status', function () {
  it('complete sentence converts', function () {
    var tree = require('./testMapper').toNested({
      timestamp: '2016-11-26T20:40:00.895Z',
      prio: 7,
      src: 15,
      dst: 255,
      pgn: 127751,
      description: 'DC Voltage/Current',
      fields: {
        'Connection Number': 2,
        'DC Voltage': 12.5,
        'DC Current': 6
      }
    })
    tree.should.have.nested.property('electrical.dc.15.2.voltage.value', 12.5)
    tree.should.have.nested.property('electrical.dc.15.2.current.value', 6)
  })
})
