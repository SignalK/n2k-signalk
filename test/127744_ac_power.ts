import chai from 'chai'
chai.should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('127744 ac power/currrent', function () {
  it('complete sentence converts', function () {
    const tree = require('./testMapper').toNested({
      timestamp: '2020-07-28T01:46:48.714Z',
      prio: 6,
      src: 33,
      dst: 255,
      pgn: 127744,
      description: 'AC Power / Current- Phase A',
      fields: {
        SID: 133,
        'Connection Number': 0,
        'AC RMS Current': 11,
        Power: 120
      }
    })
    tree.should.have.nested.property(
      'electrical.ac.0.phase.A.realPower.value',
      120
    )
    tree.should.have.nested.property(
      'electrical.ac.0.phase.A.current.value',
      11
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('writes each connection number to its own bus', function () {
    const tree = require('./testMapper').toNested({
      timestamp: '2020-07-28T01:46:48.714Z',
      prio: 6,
      src: 33,
      dst: 255,
      pgn: 127744,
      fields: { SID: 133, 'Connection Number': 2, Power: 120 }
    })
    tree.should.have.nested.property(
      'electrical.ac.2.phase.A.realPower.value',
      120
    )
    tree.electrical.ac.should.not.have.property('0')
  })
})
