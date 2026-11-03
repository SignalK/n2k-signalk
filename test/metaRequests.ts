import chai from 'chai'
chai.should()

import { N2kMapper } from '../dist/n2kMapper'

const EVENT = 'nmea2000JsonOut'
const ISO_REQUEST = 59904
const BROADCAST = 255
const REQUEST_TIMEOUT_MS = 5000
// Object.keys order of the mapper's metadata PGNs, which it requests by key.
const META_PGNS = ['60928', '126996', '126998']
const SRC = 12

const addressClaim = (src: number): any => ({
  prio: 6,
  pgn: 60928,
  dst: 255,
  src,
  timestamp: '2019-05-31T11:46:58.594Z',
  fields: {
    uniqueNumber: 76223,
    manufacturerCode: 'Fusion Electronics',
    deviceInstanceLower: 0,
    deviceInstanceUpper: 0,
    deviceFunction: 130,
    Spare: 0,
    deviceClass: 'Entertainment',
    systemInstance: 0,
    industryGroup: 'Marine',
    arbitraryAddressCapable: 1
  }
})

// Lets the promise chains a fired timer resumes run to their next timer.
const settle = () => new Promise(resolve => setImmediate(resolve))

describe('metadata requests', function () {
  interface Timer {
    fn: () => void
    ms: number
  }
  let timers: Timer[]
  let realSetTimeout: typeof setTimeout

  beforeEach(function () {
    timers = []
    realSetTimeout = global.setTimeout
    global.setTimeout = (((fn: () => void, ms: number) => {
      timers.push({ fn, ms })
      return timers.length
    }) as unknown) as typeof setTimeout
  })

  afterEach(function () {
    global.setTimeout = realSetTimeout
  })

  async function fireTimer () {
    timers.length.should.be.above(0)
    const timer = timers.shift()!
    timer.ms.should.equal(REQUEST_TIMEOUT_MS)
    timer.fn()
    await settle()
  }

  function listener () {
    const requests: unknown[] = []
    return {
      requests,
      emit (event: string, request: unknown) {
        requests.push({ event, request })
      }
    }
  }

  const request = (dst: number | string, pgn: string) => ({
    event: EVENT,
    request: { pgn: ISO_REQUEST, dst, PGN: pgn }
  })

  it('requests nothing before the n2k output is available', async function () {
    const mapper = new N2kMapper()
    await mapper.requestMetaData(BROADCAST, 60928)
    timers.should.be.empty
  })

  it('broadcasts a request for each metadata PGN in turn', async function () {
    const mapper = new N2kMapper()
    const out = listener()
    mapper.n2kOutIsAvailable(out, EVENT)
    out.requests.should.deep.equal([request(BROADCAST, META_PGNS[0])])
    await fireTimer()
    out.requests.should.deep.equal(
      META_PGNS.slice(0, 2).map(pgn => request(BROADCAST, pgn))
    )
    await fireTimer()
    await fireTimer()
    out.requests.should.deep.equal(
      META_PGNS.map(pgn => request(BROADCAST, pgn))
    )
    timers.should.be.empty
  })

  it('asks a known source again and reports the PGNs it never sent', async function () {
    const mapper = new N2kMapper()
    mapper.toDelta(addressClaim(SRC))
    const timeouts: unknown[] = []
    mapper.on('n2kSourceMetadataTimeout', (pgn: string, src: string) =>
      timeouts.push([pgn, src])
    )
    const out = listener()
    mapper.n2kOutIsAvailable(out, EVENT)
    for (let i = 0; i < META_PGNS.length; i++) {
      await fireTimer()
    }
    const src = String(SRC)
    out.requests
      .slice(META_PGNS.length)
      .should.deep.equal([request(src, '126996')])
    timeouts.should.be.empty
    await fireTimer()
    out.requests
      .slice(META_PGNS.length)
      .should.deep.equal([request(src, '126996'), request(src, '126998')])
    await fireTimer()
    timeouts.should.deep.equal([
      ['126996', src],
      ['126998', src]
    ])
    timers.should.be.empty
  })
})
