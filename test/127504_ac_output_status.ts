import chai from 'chai'
chai.should()
chai.use(require('@signalk/signalk-schema').chaiModule)

import { FromPgn, pgnToActisenseSerialFormat } from '@canboat/canboatjs'
import { PGN_127504 } from '@canboat/ts-pgns'
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
  it('writes line 1 under electrical.inverters.<instance>.ac', function () {
    mapper.testToDelta(frame).updates[0].values.should.deep.equal([
      { path: 'electrical.inverters.2.ac.lineNeutralVoltage', value: 230 },
      { path: 'electrical.inverters.2.ac.current', value: 3 },
      { path: 'electrical.inverters.2.ac.frequency', value: 50 },
      { path: 'electrical.inverters.2.ac.breakerSize', value: 10 },
      { path: 'electrical.inverters.2.ac.realPower', value: 690 },
      { path: 'electrical.inverters.2.ac.reactivePower', value: 5 },
      { path: 'electrical.inverters.2.ac.powerFactor', value: 0.99 }
    ])
  })

  it('writes the waveform in lowercase', function () {
    const sine = JSON.parse(JSON.stringify(frame))
    sine.fields.list[0].waveform = 'Modified sine wave'
    mapper.testToDelta(sine).updates[0].values.should.deep.include({
      path: 'electrical.inverters.2.ac.waveform',
      value: 'modified sine wave'
    })
  })

  it('writes a line with an unknown name as line 1', function () {
    const unknown = JSON.parse(JSON.stringify(frame))
    unknown.fields.list[0].line = 'Line 9'
    mapper.testToDelta(unknown).updates[0].values[0].should.deep.equal({
      path: 'electrical.inverters.2.ac.lineNeutralVoltage',
      value: 230
    })
  })

  it('writes lines 2 and 3 of a frame decoded by canboatjs under ac.phase.B and .C', function () {
    // #367: canboatjs decodes line as 'Line 1' to 'Line 3'. There is no
    // capture of a multi-line frame from real equipment, so it is
    // encoded and decoded through canboatjs.
    const frameOut = new PGN_127504(
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
    frameOut.src = 1
    frameOut.prio = 2
    const decoded = new FromPgn({ useCamel: true }).parseString(
      pgnToActisenseSerialFormat(frameOut)
    )
    mapper
      .testToDelta(decoded)
      .updates[0].values.filter(({ path }: { path: string }) =>
        path.endsWith('.lineNeutralVoltage')
      )
      .should.deep.equal([
        { path: 'electrical.inverters.0.ac.lineNeutralVoltage', value: 230 },
        {
          path: 'electrical.inverters.0.ac.phase.B.lineNeutralVoltage',
          value: 231
        },
        {
          path: 'electrical.inverters.0.ac.phase.C.lineNeutralVoltage',
          value: 232
        }
      ])
  })
  it('writes paths the specification has', function () {
    const tree = mapper.toNested(frame)
    // breakerSize has no path in the specification
    delete tree.electrical.inverters[2].ac.breakerSize
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
