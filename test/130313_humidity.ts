import chai from 'chai'
chai.should()

const mapper = require('./testMapper')

function frame(
  instance: number | undefined,
  source: number | undefined,
  actualHumidity: number
) {
  return {
    timestamp: '2026-10-19T12:00:00.000Z',
    prio: 6,
    src: 17,
    dst: 255,
    pgn: 130313,
    fields: { sid: 0, instance, source, actualHumidity }
  }
}

describe('130313 humidity', function () {
  it('writes an unmapped source under environment.userDefined<source>', function () {
    mapper
      .testToDelta(frame(2, 5, 0.452))
      .updates[0].values.should.deep.equal([
        { path: 'environment.userDefined5.2.relativeHumidity', value: 0.452 }
      ])
  })

  it('writes nothing for a frame without a source', function () {
    mapper
      .testToDelta(frame(0, undefined, 0.452))
      .updates[0].values.should.deep.equal([])
  })

  it('writes instance 0 for a frame without an instance', function () {
    const delta = mapper.testToDelta(frame(undefined, 5, 0.452))
    delta.updates[0].values.should.deep.equal([
      { path: 'environment.userDefined5.0.relativeHumidity', value: 0.452 }
    ])
    delta.updates[0].source.should.not.have.property('instance')
  })
})
