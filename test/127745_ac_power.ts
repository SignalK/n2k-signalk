import chai from 'chai'
chai.should()
chai.use(require('chai-things'))

describe('127745 ac power/currrent', function () {
  it('complete sentence converts', function () {
    const tree = require('./testMapper').toNested(
      {
        timestamp: '2020-07-28T01:46:48.714Z',
        prio: 6,
        src: 33,
        dst: 255,
        pgn: 127745,
        description: 'AC Power / Current- Phase B',
        fields: {
          SID: 133,
          'Connection Number': 0,
          'AC RMS Current': 11,
          Power: 120
        }
      },
      { 33: { deviceInstance: 1 } }
    )
    tree.should.have.nested.property(
      'electrical.ac.1.phase.B.realPower.value',
      120
    )
    tree.should.have.nested.property(
      'electrical.ac.1.phase.B.current.value',
      11
    )
  })
})
