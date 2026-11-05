import chai from 'chai'
import { FromPgn } from '@canboat/canboatjs'
chai.should()

import { toDeltaTransformer, toDelta } from '../dist/n2kMapper'

// ac42-commissioning.raw in canboat's samples
const capturedHeading = () =>
  new FromPgn({ useCamel: true }).parseString(
    '2026-06-08T01:51:24.127,2,127250,52,255,8,ff,51,9c,ff,7f,55,06,fc'
  )!

describe('toDeltaTransformer', function () {
  it('emits nothing for a report toDelta drops', function (done) {
    const stream = toDeltaTransformer({}, {})
    const emitted: unknown[] = []
    stream.on('data', (d: unknown) => emitted.push(d))
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

  it('drops a string or buffer without logging', function (done) {
    const stream = toDeltaTransformer({}, {})
    const emitted: unknown[] = []
    const logged: unknown[] = []
    const error = console.error
    console.error = (...args: unknown[]) => logged.push(args)
    stream.on('data', (d: unknown) => emitted.push(d))
    stream.on('end', () => {
      console.error = error
      emitted.should.have.lengthOf(0)
      logged.should.have.lengthOf(0)
      done()
    })
    stream.write('not a frame')
    stream.write(Buffer.from('not a frame'))
    stream.end()
  })

  it('calls the write and end callbacks', function (done) {
    const stream = toDeltaTransformer({}, {})
    const called: string[] = []
    stream.on('data', () => {})
    stream.write(capturedHeading(), () => called.push('write'))
    stream.end(() => {
      called.push('end')
      // Node calls a write's callback before the end's
      called.should.deep.equal(['write', 'end'])
      done()
    })
  })

  it('calls the write callback first when a listener ends the stream', function (done) {
    const stream = toDeltaTransformer({}, {})
    const called: string[] = []
    stream.once('data', () => {
      stream.end(() => {
        called.push('end')
        called.should.deep.equal(['write', 'end'])
        done()
      })
    })
    stream.write(capturedHeading(), () => called.push('write'))
  })

  it('returns the stream from a repeated end, pause or destroy', function () {
    const stream = toDeltaTransformer({}, {})
    stream.pause().should.equal(stream)
    stream.pause().should.equal(stream)
    stream.end().should.equal(stream)
    stream.end().should.equal(stream)
    stream.destroy().should.equal(stream)
    stream.destroy().should.equal(stream)
  })
})

describe('toDelta context', function () {
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
    const delta = toDelta(report, {}, customPgns)!
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

describe('toDelta values without a path', function () {
  it("leaves out a function mapping's value that has no path", function () {
    const report = {
      pgn: 999002,
      src: 3,
      dst: 255,
      prio: 4,
      timestamp: '2022-05-09T13:38:38.917Z',
      fields: { value: 7 }
    }
    const customPgns = {
      999002: [
        () => [
          { path: 'test.good', value: 1 },
          { path: undefined, value: 2 }
        ]
      ]
    }
    const consoleError = console.error
    console.error = () => {}
    let delta
    try {
      delta = toDelta(report, {}, customPgns)
    } finally {
      console.error = consoleError
    }
    delta!.updates[0].values.should.deep.equal([
      { path: 'test.good', value: 1 }
    ])
  })
})
