import chai from 'chai'
chai.should()

import { N2kMapper } from '../dist/n2kMapper'

const EVENT = 'nmea2000JsonOut'
const ISO_REQUEST = 59904
const ANSWER_TIMEOUT_MS = 2000
const REQUEST_INTERVAL_MS = 5 * 60 * 1000
const IDLE_CHECK_MS = 10000
const SRC = 12
const BROADCAST = 255

const addressClaim = (src: number, uniqueNumber = 76223): any => ({
  prio: 6,
  pgn: 60928,
  dst: 255,
  src,
  timestamp: '2019-05-31T11:46:58.594Z',
  fields: {
    uniqueNumber,
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

const productInfo = (src: number): any => ({
  prio: 6,
  pgn: 126996,
  dst: 255,
  src,
  timestamp: '2019-05-31T11:46:59.594Z',
  fields: { nmea2000Version: 2.1, productCode: 1 }
})

const configInfo = (src: number): any => ({
  prio: 6,
  pgn: 126998,
  dst: 255,
  src,
  timestamp: '2019-05-31T11:46:59.594Z',
  fields: { installationDescription1: 'mast' }
})

const heading = (src: number): any => ({
  prio: 2,
  pgn: 127250,
  dst: 255,
  src,
  timestamp: '2019-05-31T11:46:59.594Z',
  fields: { heading: 1, reference: 'Magnetic' }
})

const nak = (src: number, pgn: number): any => ({
  prio: 6,
  pgn: 59392,
  dst: 0,
  src,
  timestamp: '2019-05-31T11:46:59.594Z',
  fields: { control: 'NAK', groupFunction: 255, pgn }
})

describe('metadata requests', function () {
  interface Timer {
    fn: () => void
    ms: number
    id: number
  }
  let timers: Timer[]
  let nextId: number
  let time: number
  const real = {
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
    now: Date.now
  }

  beforeEach(function () {
    timers = []
    nextId = 1
    time = 1000000
    global.setTimeout = ((fn: () => void, ms: number) => {
      const id = nextId++
      timers.push({ fn, ms, id })
      return id
    }) as unknown as typeof setTimeout
    global.clearTimeout = ((id: number) => {
      timers = timers.filter((timer) => timer.id !== id)
    }) as unknown as typeof clearTimeout
    Date.now = () => time
  })

  afterEach(function () {
    global.setTimeout = real.setTimeout
    global.clearTimeout = real.clearTimeout
    Date.now = real.now
  })

  // Fires the first pending timer of ms.
  function fire(ms: number) {
    const timer = timers.find((timer) => timer.ms === ms)
    chai.expect(timer, `a timer of ${ms} ms`).to.not.equal(undefined)
    timers = timers.filter((t) => t !== timer)
    timer!.fn()
  }

  function listening(mapper: N2kMapper) {
    const requests: [number | string, number | string][] = []
    mapper.n2kOutIsAvailable(
      {
        emit(event: string, request: any) {
          event.should.equal(EVENT)
          request.pgn.should.equal(ISO_REQUEST)
          requests.push([request.dst, request.PGN])
        }
      },
      EVENT
    )
    requests.should.deep.equal([[BROADCAST, 60928]])
    requests.length = 0
    return requests
  }

  it('requests nothing before the n2k output is available', async function () {
    const mapper = new N2kMapper()
    mapper.toDelta(heading(SRC))
    await mapper.requestMetaData(SRC, 60928)
    timers.should.be.empty
  })

  it('broadcasts only a request for address claims', function () {
    const requests = listening(new N2kMapper())
    requests.should.be.empty
    timers.should.have.lengthOf(1)
    timers[0].ms.should.equal(IDLE_CHECK_MS)
  })

  it('asks a device for each metadata PGN as each answer arrives', function () {
    const mapper = new N2kMapper()
    const requests = listening(mapper)
    mapper.toDelta(heading(SRC))
    requests.should.deep.equal([[SRC, '60928']])
    mapper.toDelta(addressClaim(SRC))
    requests.should.deep.equal([
      [SRC, '60928'],
      [SRC, '126996']
    ])
    mapper.toDelta(productInfo(SRC))
    requests.should.deep.equal([
      [SRC, '60928'],
      [SRC, '126996'],
      [SRC, '126998']
    ])
    mapper.toDelta(configInfo(SRC))
    requests.should.have.lengthOf(3)
  })

  it('asks one device at a time', function () {
    const mapper = new N2kMapper()
    const requests = listening(mapper)
    mapper.toDelta(addressClaim(SRC))
    mapper.toDelta(addressClaim(SRC + 1))
    requests.should.deep.equal([[SRC, '126996']])
    mapper.toDelta(productInfo(SRC))
    mapper.toDelta(configInfo(SRC))
    requests.should.deep.equal([
      [SRC, '126996'],
      [SRC, '126998'],
      [SRC + 1, '126996']
    ])
  })

  it('does not ask a device for what it sent on its own', function () {
    const mapper = new N2kMapper()
    mapper.toDelta(addressClaim(SRC))
    mapper.toDelta(productInfo(SRC))
    mapper.toDelta(configInfo(SRC))
    listening(mapper).should.be.empty
  })

  it('moves on when a device NAKs a request', function () {
    const mapper = new N2kMapper()
    const timeouts: unknown[] = []
    mapper.on('n2kSourceMetadataTimeout', (pgn: string, src: string) =>
      timeouts.push([pgn, src])
    )
    const requests = listening(mapper)
    mapper.toDelta(addressClaim(SRC))
    mapper.toDelta(nak(SRC, 126996))
    requests.should.deep.equal([
      [SRC, '126996'],
      [SRC, '126998']
    ])
    timeouts.should.deep.equal([['126996', String(SRC)]])
  })

  it('ignores a NAK for another PGN', function () {
    const mapper = new N2kMapper()
    const requests = listening(mapper)
    mapper.toDelta(addressClaim(SRC))
    mapper.toDelta(nak(SRC, 130000))
    requests.should.deep.equal([[SRC, '126996']])
  })

  it('moves on when a device does not answer, and reports it once', function () {
    const mapper = new N2kMapper()
    const timeouts: unknown[] = []
    mapper.on('n2kSourceMetadataTimeout', (pgn: string, src: string) =>
      timeouts.push([pgn, src])
    )
    const requests = listening(mapper)
    mapper.toDelta(heading(SRC))
    fire(ANSWER_TIMEOUT_MS)
    fire(ANSWER_TIMEOUT_MS)
    fire(ANSWER_TIMEOUT_MS)
    requests.should.deep.equal([
      [SRC, '60928'],
      [SRC, '126996'],
      [SRC, '126998']
    ])
    timeouts.should.deep.equal([
      ['60928', String(SRC)],
      ['126996', String(SRC)],
      ['126998', String(SRC)]
    ])

    time += REQUEST_INTERVAL_MS
    fire(IDLE_CHECK_MS)
    requests.should.have.lengthOf(4)
    fire(ANSWER_TIMEOUT_MS)
    timeouts.should.have.lengthOf(3)
  })

  it('asks again after five minutes', function () {
    const mapper = new N2kMapper()
    const requests = listening(mapper)
    mapper.toDelta(addressClaim(SRC))
    mapper.toDelta(configInfo(SRC))
    mapper.toDelta(productInfo(SRC))
    requests.should.deep.equal([[SRC, '126996']])
    time += REQUEST_INTERVAL_MS - 1
    fire(IDLE_CHECK_MS)
    requests.should.have.lengthOf(1)
    time += 1
    fire(IDLE_CHECK_MS)
    requests.slice(1).should.deep.equal([[SRC, '60928']])
  })

  it('asks a new device at an address for its information', function () {
    const mapper = new N2kMapper()
    const requests = listening(mapper)
    mapper.toDelta(addressClaim(SRC))
    mapper.toDelta(configInfo(SRC))
    mapper.toDelta(productInfo(SRC))
    mapper.toDelta(addressClaim(SRC, 76224))
    requests.should.deep.equal([
      [SRC, '126996'],
      [SRC, '126996']
    ])
  })

  it('does not ask the null or global address', function () {
    const mapper = new N2kMapper()
    const requests = listening(mapper)
    mapper.toDelta(heading(254))
    mapper.toDelta(heading(255))
    requests.should.be.empty
  })

  it('asks a device for given PGNs at once, whatever it sent', function () {
    const mapper = new N2kMapper()
    const requests = listening(mapper)
    mapper.toDelta(addressClaim(SRC))
    mapper.toDelta(productInfo(SRC))
    mapper.toDelta(configInfo(SRC))
    requests.should.deep.equal([
      [SRC, '126996'],
      [SRC, '126998']
    ])
    mapper.requestSourceMeta(SRC, [126998])
    requests.slice(2).should.deep.equal([[SRC, '126998']])
    mapper.toDelta(configInfo(SRC))
    requests.should.have.lengthOf(3)
  })

  it('asks for given PGNs ahead of what is due', function () {
    const mapper = new N2kMapper()
    const requests = listening(mapper)
    mapper.toDelta(heading(SRC))
    mapper.toDelta(heading(SRC + 1))
    mapper.requestSourceMeta(SRC + 1, [60928])
    mapper.toDelta(addressClaim(SRC))
    requests.should.deep.equal([
      [SRC, '60928'],
      [SRC + 1, '60928']
    ])
  })

  it('asks every device for everything again', function () {
    const mapper = new N2kMapper()
    const requests = listening(mapper)
    ;[SRC, SRC + 1].forEach((src) => {
      mapper.toDelta(addressClaim(src))
      mapper.toDelta(productInfo(src))
      mapper.toDelta(configInfo(src))
    })
    requests.length = 0
    mapper.requestAllMeta().should.equal(2)
    for (const src of [SRC, SRC + 1]) {
      mapper.toDelta(addressClaim(src))
      mapper.toDelta(productInfo(src))
      mapper.toDelta(configInfo(src))
    }
    requests.should.deep.equal([
      [SRC, '60928'],
      [SRC, '126996'],
      [SRC, '126998'],
      [SRC + 1, '60928'],
      [SRC + 1, '126996'],
      [SRC + 1, '126998']
    ])
  })
})
