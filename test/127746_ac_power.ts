import chai from 'chai'
chai.should()
chai.use(require('chai-things'))

describe('127746 ac power/currrent', function () {
  it('complete sentence converts', function () {
    const tree = require('./testMapper').toNested({
      timestamp: '2020-07-28T01:46:48.714Z',
      prio: 6,
      src: 33,
      dst: 255,
      pgn: 127746,
      description: 'AC Power / Current- Phase C',
      fields: {
        SID: 133,
        'Connection Number': 0,
        'AC RMS Current': 11,
        Power: 120
      }
    })
    tree.should.have.nested.property(
      'electrical.ac.0.phase.C.realPower.value',
      120
    )
    tree.should.have.nested.property(
      'electrical.ac.0.phase.C.current.value',
      11
    )
  })
})
