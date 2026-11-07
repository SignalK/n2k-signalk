import chai from 'chai'
chai.should()
chai.use(require('@signalk/signalk-schema').chaiModule)
const { expect } = chai

import { EventEmitter } from 'events'
import { defaultPrefix, N2kMapper, N2kMapperOptions } from '../dist/n2kMapper'
import { decode } from './instanceFrames'

const signalkSchema = require('@signalk/signalk-schema')

const SRC = 33
const TIMESTAMP = '2026-09-28T12:00:00.000Z'

const claim = (
  deviceInstanceLower: number,
  deviceInstanceUpper: number
): any => ({
  timestamp: TIMESTAMP,
  prio: 6,
  src: SRC,
  dst: 255,
  pgn: 60928,
  fields: {
    uniqueNumber: 76223,
    manufacturerCode: 'Victron Energy',
    deviceInstanceLower,
    deviceInstanceUpper,
    deviceFunction: 153,
    deviceClass: 'Electrical Generation',
    systemInstance: 0,
    industryGroup: 'Marine'
  }
})

const power = (connectionNumber?: number) =>
  decode(127744, SRC, { connectionNumber, acRmsCurrent: 3, power: 100 })

function paths(mapper: N2kMapper, n2k: any): string[] {
  return mapper.toDelta(n2k)!.updates[0].values.map((v: any) => v.path)
}

function knownMapper(lower = 1, upper = 0) {
  const mapper = new N2kMapper()
  mapper.toDelta(claim(lower, upper))
  return mapper
}

describe('AC bus key', function () {
  it('is the device instance, for connection 0', function () {
    paths(knownMapper(), power(0)).should.have.members([
      'electrical.ac.1.phase.A.realPower',
      'electrical.ac.1.phase.A.current'
    ])
  })

  it('adds any other connection', function () {
    paths(knownMapper(), power(2)).should.have.members([
      'electrical.ac.1c2.phase.A.realPower',
      'electrical.ac.1c2.phase.A.current'
    ])
  })

  it('uses the upper and lower device instance', function () {
    paths(knownMapper(1, 1), power(0)).should.include(
      'electrical.ac.9.phase.A.current'
    )
  })

  it('matches the bus of the same device instance in 65014', function () {
    const mapper = knownMapper()
    const bus = (n2k: any) => paths(mapper, n2k)[0].split('.phase.')[0]
    bus(power(0)).should.equal(
      bus(
        decode(65014, SRC, {
          lineLineAcRmsVoltage: 400,
          lineNeutralAcRmsVoltage: 230,
          acFrequency: 50,
          acRmsCurrent: 3
        })
      )
    )
  })

  it('writes a valid tree', function () {
    for (const connection of [0, 2]) {
      const delta: any = knownMapper().toDelta(power(connection))
      delta.context = 'vessels.' + signalkSchema.fakeMmsiId
      signalkSchema.deltaToFull(delta).vessels[signalkSchema.fakeMmsiId].should
        .be.validSignalKVesselIgnoringIdentity
    }
  })

  it('writes nothing before the address claim', function () {
    paths(new N2kMapper(), power(0)).should.deep.equal([])
  })

  it('writes nothing for a frame without a connection number', function () {
    paths(knownMapper(), power()).should.deep.equal([])
  })

  it('follows a new device at the address', function () {
    const mapper = knownMapper()
    mapper.requestMetaData = () => Promise.resolve()
    mapper.toDelta({
      ...claim(3, 0),
      fields: { ...claim(3, 0).fields, uniqueNumber: 76224 }
    })
    paths(mapper, power(0)).should.include('electrical.ac.3.phase.A.current')
  })

  it('still lets a resolver name the bus without the device', function () {
    const mapper = new N2kMapper({
      instancePrefixResolver: () => 'electrical.ac.shore'
    })
    paths(mapper, power(0)).should.have.members([
      'electrical.ac.shore.phase.A.realPower',
      'electrical.ac.shore.phase.A.current'
    ])
  })

  it('has a default prefix only for a known device', function () {
    expect(defaultPrefix('acConnection', undefined, 1, SRC)).to.equal(undefined)
    defaultPrefix('acConnection', undefined, 1, SRC, undefined, {
      deviceInstance: 3
    })!.should.equal('electrical.ac.3c1')
  })

  describe('asking the device', function () {
    const { now } = Date
    let time: number
    let requests: unknown[][]

    function listening(options?: N2kMapperOptions) {
      const mapper = new N2kMapper(options)
      mapper.n2kListener = {} as any
      mapper.requestMetaData = (dst, pgn) => {
        requests.push([dst, pgn])
        return Promise.resolve()
      }
      return mapper
    }

    beforeEach(function () {
      time = 1000000
      requests = []
      Date.now = () => time
    })

    afterEach(function () {
      Date.now = now
    })

    it('asks once every 10 s while the device sends such frames', function () {
      const mapper = listening()
      mapper.toDelta(power(0))
      requests.should.deep.equal([[SRC, 60928]])
      time += 9999
      mapper.toDelta(power(0))
      requests.should.have.lengthOf(1)
      time += 1
      mapper.toDelta(power(0))
      requests.should.deep.equal([
        [SRC, 60928],
        [SRC, 60928]
      ])
    })

    it('does not ask without such frames', function () {
      const mapper = listening()
      mapper.toDelta(
        decode(127751, SRC, { connectionNumber: 0, dcVoltage: 12 })
      )
      requests.should.deep.equal([])
    })

    it('stops asking when the device has answered', function () {
      const mapper = listening()
      mapper.toDelta(power(0))
      mapper.toDelta(claim(1, 0))
      requests.length = 0
      time += 10000
      paths(mapper, power(0)).should.not.be.empty
      requests.should.deep.equal([])
    })

    it('does not ask for a bus a resolver names', function () {
      const mapper = listening({
        instancePrefixResolver: () => 'electrical.ac.shore'
      })
      mapper.toDelta(power(0))
      requests.should.deep.equal([])
    })

    it('does not ask about a frame without a connection number', function () {
      const mapper = listening()
      mapper.toDelta(power())
      requests.should.deep.equal([])
    })

    it('does not ask without n2k output', function () {
      const mapper = listening()
      mapper.n2kListener = undefined
      mapper.toDelta(power(0))
      requests.should.deep.equal([])
    })

    it('sends the request to the device', function () {
      const mapper = new N2kMapper()
      const sent: unknown[] = []
      const out = new EventEmitter()
      out.on('out', (request) => sent.push(request))
      mapper.n2kListener = out as any
      mapper.n2kOutEvent = 'out'
      mapper.requestMetaData = N2kMapper.prototype.requestMetaData
      mapper.toDelta(power(0))
      sent.should.deep.equal([{ pgn: 59904, dst: SRC, PGN: 60928 }])
    })
  })
})
