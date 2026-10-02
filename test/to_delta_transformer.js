const chai = require('chai')
chai.Should()

const { toDeltaTransformer } = require('../dist/n2kMapper')

describe('toDeltaTransformer', function () {
  it('emits nothing for a report toDelta drops', function (done) {
    const stream = toDeltaTransformer({}, {})
    const emitted = []
    stream.on('data', (d) => emitted.push(d))
    stream.on('end', () => {
      emitted.should.have.lengthOf(0)
      done()
    })
    // An AIS position report without an MMSI: canboat and canboatjs report
    // MMSI 0 as not available, so userId is absent.
    stream.write({
      pgn: 129038,
      src: 3,
      dst: 255,
      prio: 4,
      timestamp: '2022-05-09T13:38:38.917Z',
      fields: {
        messageId: 'Scheduled Class A position report',
        longitude: 10.15,
        latitude: 54.36
      }
    })
    stream.end()
  })
})

describe('toDelta context', function () {
  const { toDelta } = require('../dist/n2kMapper')
  const report = {
    pgn: 999001,
    src: 3,
    dst: 255,
    prio: 4,
    timestamp: '2022-05-09T13:38:38.917Z',
    fields: { value: 7 }
  }

  it('ignores a context mapping that does not apply to the report', function () {
    // The context mapping's filter rejects this report, so it must neither
    // set the context nor cause the report to be dropped.
    const customPgns = {
      999001: [
        { source: 'value', node: 'test.value' },
        { filter: () => false, context: () => undefined, node: 'test.other' }
      ]
    }
    const delta = toDelta(report, {}, customPgns)
    delta.updates[0].values.should.deep.equal([
      { path: 'test.value', value: 7 }
    ])
  })

  it('drops a report whose applying context mapping finds no context', function () {
    const customPgns = {
      999001: [
        { source: 'value', node: 'test.value' },
        { context: () => undefined, node: 'test.other' }
      ]
    }
    ;(typeof toDelta(report, {}, customPgns)).should.equal('undefined')
  })
})
