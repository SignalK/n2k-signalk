const chai = require('chai')
chai.Should()
chai.use(require('@signalk/signalk-schema').chaiModule)

const mapper = require('./testMapper')

const frame = {
  timestamp: '2026-10-19T12:00:00.000Z',
  prio: 6,
  src: 17,
  dst: 255,
  pgn: 127503,
  fields: {
    instance: 1,
    numberOfLines: 2,
    list: [
      {
        line: 'Line 1',
        acceptability: 'Good',
        voltage: 230,
        current: 2.5,
        frequency: 50,
        breakerSize: 16,
        realPower: 575,
        reactivePower: 10,
        powerFactor: 0.98
      },
      {
        line: 'Line 2',
        acceptability: 'Bad level',
        voltage: 231,
        current: 1.5,
        frequency: 50
      }
    ]
  }
}

describe('127503 ac input status', function () {
  // Pins current behaviour: canboatjs decodes line as "Line 2", which the
  // phase lookup does not know, so every line lands on phase A.
  it('writes two lines under electrical.ac.<instance>.A', function () {
    mapper.testToDelta(frame).updates[0].values.should.deep.equal([
      { path: 'electrical.ac.1.A.acceptability', value: 'Good' },
      { path: 'electrical.ac.1.A.voltage', value: 230 },
      { path: 'electrical.ac.1.A.current', value: 2.5 },
      { path: 'electrical.ac.1.A.frequency', value: 50 },
      { path: 'electrical.ac.1.A.breakerSize', value: 16 },
      { path: 'electrical.ac.1.A.realPower', value: 575 },
      { path: 'electrical.ac.1.A.reactivePower', value: 10 },
      { path: 'electrical.ac.1.A.powerFactor', value: 0.98 },
      { path: 'electrical.ac.1.A.acceptability', value: 'Bad level' },
      { path: 'electrical.ac.1.A.voltage', value: 231 },
      { path: 'electrical.ac.1.A.current', value: 1.5 },
      { path: 'electrical.ac.1.A.frequency', value: 50 }
    ])
  })
})
