const chai = require('chai')
chai.Should()
chai.use(require('@signalk/signalk-schema').chaiModule)

const mapper = require('./testMapper')

const frame = {
  timestamp: '2026-10-19T12:00:00.000Z',
  prio: 6,
  src: 17,
  dst: 255,
  pgn: 127504,
  fields: {
    instance: 2,
    numberOfLines: 1,
    list: [
      {
        line: 'Line 1',
        voltage: 230,
        current: 3,
        frequency: 50,
        breakerSize: 10,
        realPower: 690,
        reactivePower: 5,
        powerFactor: 0.99
      }
    ]
  }
}

describe('127504 ac output status', function () {
  // Pins current behaviour: canboatjs decodes line as "Line 1", which the
  // phase lookup does not know, so every line lands on phase A.
  it('writes the line under electrical.inverters.<instance>.A', function () {
    mapper.testToDelta(frame).updates[0].values.should.deep.equal([
      { path: 'electrical.inverters.2.A.voltage', value: 230 },
      { path: 'electrical.inverters.2.A.current', value: 3 },
      { path: 'electrical.inverters.2.A.frequency', value: 50 },
      { path: 'electrical.inverters.2.A.breakerSize', value: 10 },
      { path: 'electrical.inverters.2.A.realPower', value: 690 },
      { path: 'electrical.inverters.2.A.reactivePower', value: 5 },
      { path: 'electrical.inverters.2.A.powerFactor', value: 0.99 }
    ])
  })
})
