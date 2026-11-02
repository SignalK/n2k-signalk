import chai from 'chai'
chai.should()
import assert from 'assert'
import mapper = require('./testMapper')
import testMapper = require('./testMapper')
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
    //  missing User Id
    //  const msg = JSON.parse('{"timestamp":"2014-08-15-15:01:01.881","prio":"6","src":"43","dst":"255","pgn":"129794","description":"AIS Class A Static and Voyage Related Data","fields":{"Message ID":"5","Repeat indicator":"Initial","User ID":"230939100","IMO number":"0","Callsign":"OJ7510","Name":"RESCUE RAUTAUOMA","Type of ship":"SAR","Length":"16.0","Beam":"4.0","Position reference from Starboard":"2.0","Position reference from Bow":"9.0","ETA Date":"2014.11.30", "ETA Time": "25:00:00","Draft":"1.00","Destination":"HELSINKI LIFEBOAT","AIS version indicator":"ITU-R M.1371-1","GNSS type":"GPS","DTE":"available","Reserved":"0","AIS Transceiver information":"Channel B VDL reception"}}');
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
})

describe('Frame without src or timestamp', function () {
  function quietly (fn: () => unknown): any {
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
  const { src, ...withoutSrc } = frame
  const { timestamp, ...withoutTimestamp } = frame

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
