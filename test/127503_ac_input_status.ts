import chai from 'chai'
chai.should()
chai.use(require('@signalk/signalk-schema').chaiModule)

import { FromPgn, pgnToActisenseSerialFormat } from '@canboat/canboatjs'
import { PGN_127503 } from '@canboat/ts-pgns'
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
  it('writes each line under its own phase, as the specification names it', function () {
    mapper.testToDelta(frame).updates[0].values.should.deep.equal([
      { path: 'electrical.ac.1.phase.A.acceptability', value: 'Good' },
      { path: 'electrical.ac.1.phase.A.lineNeutralVoltage', value: 230 },
      { path: 'electrical.ac.1.phase.A.current', value: 2.5 },
      { path: 'electrical.ac.1.phase.A.frequency', value: 50 },
      { path: 'electrical.ac.1.phase.A.breaker.ratedCurrent', value: 16 },
      { path: 'electrical.ac.1.phase.A.realPower', value: 575 },
      { path: 'electrical.ac.1.phase.A.reactivePower', value: 10 },
      { path: 'electrical.ac.1.phase.A.powerFactor', value: 0.98 },
      { path: 'electrical.ac.1.phase.B.acceptability', value: 'Bad level' },
      { path: 'electrical.ac.1.phase.B.lineNeutralVoltage', value: 231 },
      { path: 'electrical.ac.1.phase.B.current', value: 1.5 },
      { path: 'electrical.ac.1.phase.B.frequency', value: 50 }
    ])
  })

  it('takes a line given as its numeric code', function () {
    const numeric = JSON.parse(JSON.stringify(frame))
    numeric.fields.list[0].line = 1
    numeric.fields.list[1].line = 2
    mapper
      .testToDelta(numeric)
      .updates[0].values.map(({ path }: { path: string }) => path.split('.')[4])
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
    // #367: canboatjs decodes line as 'Line 1' to 'Line 3'. There is no
    // capture of a multi-line frame from real equipment, so it is
    // encoded and decoded through canboatjs.
    const frameIn = new PGN_127503(
      {
        instance: 0,
        numberOfLines: 3,
        list: [
          { line: 0, voltage: 230 },
          { line: 1, voltage: 231 },
          { line: 2, voltage: 232 }
        ]
      },
      255
    )
    frameIn.src = 1
    frameIn.prio = 2
    const decoded = new FromPgn({ useCamel: true }).parseString(
      pgnToActisenseSerialFormat(frameIn)
    )
    mapper
      .testToDelta(decoded)
      .updates[0].values.filter(({ path }: { path: string }) =>
        path.endsWith('.lineNeutralVoltage')
      )
      .should.deep.equal([
        { path: 'electrical.ac.0.phase.A.lineNeutralVoltage', value: 230 },
        { path: 'electrical.ac.0.phase.B.lineNeutralVoltage', value: 231 },
        { path: 'electrical.ac.0.phase.C.lineNeutralVoltage', value: 232 }
      ])
  })
  it('writes paths the specification has', function () {
    const tree = mapper.toNested(frame)
    // acceptability and breaker have no path in the specification
    Object.values(tree.electrical.ac[1].phase).forEach((line: any) => {
      delete line.acceptability
      delete line.breaker
    })
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
