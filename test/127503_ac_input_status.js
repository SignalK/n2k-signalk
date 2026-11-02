const chai = require('chai')
chai.Should()
chai.use(require('@signalk/signalk-schema').chaiModule)

const { FromPgn, pgnToActisenseSerialFormat } = require('@canboat/canboatjs')
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
  it('writes each line under its own phase', function () {
    mapper.testToDelta(frame).updates[0].values.should.deep.equal([
      { path: 'electrical.ac.1.A.acceptability', value: 'Good' },
      { path: 'electrical.ac.1.A.voltage', value: 230 },
      { path: 'electrical.ac.1.A.current', value: 2.5 },
      { path: 'electrical.ac.1.A.frequency', value: 50 },
      { path: 'electrical.ac.1.A.breakerSize', value: 16 },
      { path: 'electrical.ac.1.A.realPower', value: 575 },
      { path: 'electrical.ac.1.A.reactivePower', value: 10 },
      { path: 'electrical.ac.1.A.powerFactor', value: 0.98 },
      { path: 'electrical.ac.1.B.acceptability', value: 'Bad level' },
      { path: 'electrical.ac.1.B.voltage', value: 231 },
      { path: 'electrical.ac.1.B.current', value: 1.5 },
      { path: 'electrical.ac.1.B.frequency', value: 50 }
    ])
  })

  it('takes a line given as its numeric code', function () {
    const numeric = JSON.parse(JSON.stringify(frame))
    numeric.fields.list[0].line = 1
    numeric.fields.list[1].line = 2
    mapper
      .testToDelta(numeric)
      .updates[0].values.map(({ path }) => path.split('.')[3])
      .should.deep.equal([
        'B',
        'B',
        'B',
        'B',
        'B',
        'B',
        'B',
        'B',
        'C',
        'C',
        'C',
        'C'
      ])
  })

  it('writes the lines of a frame decoded by canboatjs to phases A, B and C', function () {
    // #367: canboatjs decodes line as 'Line 1' to 'Line 3'.
    const decoded = new FromPgn({ useCamel: true }).parseString(
      pgnToActisenseSerialFormat({
        pgn: 127503,
        src: 1,
        dst: 255,
        prio: 2,
        fields: {
          instance: 0,
          numberOfLines: 3,
          list: [
            { line: 0, voltage: 230 },
            { line: 1, voltage: 231 },
            { line: 2, voltage: 232 }
          ]
        }
      })
    )
    mapper
      .testToDelta(decoded)
      .updates[0].values.filter(({ path }) => path.endsWith('.voltage'))
      .should.deep.equal([
        { path: 'electrical.ac.0.A.voltage', value: 230 },
        { path: 'electrical.ac.0.B.voltage', value: 231 },
        { path: 'electrical.ac.0.C.voltage', value: 232 }
      ])
  })
})
