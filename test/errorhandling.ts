import chai from 'chai'
chai.should()
import assert from 'assert'
import mapper = require('./testMapper')
import { N2kMapper, toDelta } from '../dist/n2kMapper'

describe('Unknown pgn', function () {
  it('returns delta with one update that has no values', function () {
    const delta = mapper.toDelta(
      JSON.parse(
        '{"timestamp":"2013-10-08-16:04:06.044","prio":"3","src":"1","dst":"255","pgn":"999999","description":"System Time","fields":{"SID":"222","Date":"2013.10.08", "Time": "16:04:00"}}'
      )
    )!
    assert.equal(delta.updates[0].values.length, 0)
  })
})

describe('No fields in pgn message', function () {
  it('does not throw any errors', function () {
    const msg = {
      timestamp: '2014-08-15-15:01:01.881',
      prio: '6',
      src: '43',
      dst: '255',
      pgn: 128267
    }

    const delta = mapper.toDelta(msg)!
    assert.equal(delta.updates[0].values.length, 0)
  })

  // #107: such a frame is not an error to log, whichever PGN it claims to be.
  describe('of any PGN', function () {
    const pgns = Object.keys(require('../dist/pgns'))
    let logged: unknown[]
    const { error } = console
    const { write } = process.stderr

    beforeEach(function () {
      logged = []
      console.error = (...args: unknown[]) => {
        logged.push(args)
      }
      process.stderr.write = ((chunk: unknown) => {
        logged.push(chunk)
        return true
      }) as typeof process.stderr.write
    })

    afterEach(function () {
      console.error = error
      process.stderr.write = write
    })

    for (const fields of [undefined, null]) {
      it(`gives no values and logs nothing with fields ${fields}`, function () {
        pgns.should.not.be.empty
        pgns.forEach((pgn) => {
          const frame: any = {
            timestamp: '2017-12-08T17:11:14.824Z',
            prio: 5,
            src: 114,
            dst: 255,
            pgn: Number(pgn),
            fields
          }
          for (const delta of [
            toDelta(frame),
            toDelta(frame, {}),
            new N2kMapper().toDelta(frame)
          ]) {
            assert.equal(delta!.updates[0].values.length, 0, pgn)
          }
        })
        logged.should.deep.equal([])
      })
    }

    for (const fields of [undefined, null]) {
      for (const pgn of [60928, 126996, 126998]) {
        it(`does not call metadata PGN ${pgn} unknown with fields ${fields}`, function () {
          const mapper = new N2kMapper()
          const emitted: unknown[] = []
          mapper.on('n2kSourceMetadata', (...args: unknown[]) => {
            emitted.push(args)
          })
          const delta = mapper.toDelta({
            timestamp: '2017-12-08T17:11:14.824Z',
            prio: 5,
            src: 114,
            dst: 255,
            pgn,
            fields
          } as any)
          assert.equal(delta!.updates[0].values.length, 0)
          emitted.should.deep.equal([])
          mapper.unknownPGNs.should.deep.equal({})
          logged.should.deep.equal([])
        })
      }
    }
  })
})

describe('Frame without src or timestamp', function () {
  function quietly(fn: () => unknown): any {
    const consoleError = console.error
    console.error = () => {}
    try {
      return fn()
    } finally {
      console.error = consoleError
    }
  }

  const frame: any = {
    timestamp: '2014-08-15T15:01:01.881Z',
    prio: 2,
    src: 17,
    dst: 255,
    pgn: 128267,
    fields: { depth: 5.2, offset: 0 }
  }
  const { src: _src, ...withoutSrc } = frame
  const { timestamp: _timestamp, ...withoutTimestamp } = frame

  it('converts the complete frame to values', function () {
    toDelta(frame)!.updates[0].values.should.not.be.empty
  })

  for (const [what, n2k] of [
    ['src', withoutSrc],
    ['timestamp', withoutTimestamp]
  ]) {
    it(`converts a frame without ${what} to no values`, function () {
      quietly(() => toDelta(n2k)).should.deep.equal({ updates: [] })
      quietly(() => toDelta(n2k, {})).should.deep.equal({ updates: [] })
      quietly(() => new N2kMapper().toDelta(n2k)).should.deep.equal({
        updates: []
      })
    })
  }
})
