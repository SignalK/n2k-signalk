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

const productInfo = (modelId?: string): any => ({
  timestamp: TIMESTAMP,
  prio: 6,
  src: SRC,
  dst: 255,
  pgn: 126996,
  fields: { nmea2000Version: 2100, productCode: 1, modelId }
})

const power = (connectionNumber?: number) =>
  decode(127744, SRC, { connectionNumber, acRmsCurrent: 3, power: 100 })

function paths(mapper: N2kMapper, n2k: any): string[] {
  return mapper.toDelta(n2k)!.updates[0].values.map((v: any) => v.path)
}

function knownMapper(modelId?: string) {
  const mapper = new N2kMapper()
  mapper.toDelta(claim(1, 0))
  mapper.toDelta(productInfo(modelId))
  return mapper
}

describe('AC bus key', function () {
  it('is the model and device instance, for connection 0', function () {
    paths(knownMapper('Skylla-i 24/80'), power(0)).should.have.members([
      'electrical.ac.Skyllai24801.phase.A.realPower',
      'electrical.ac.Skyllai24801.phase.A.current'
    ])
  })

  it('adds any other connection', function () {
    paths(knownMapper('Multi'), power(2)).should.have.members([
      'electrical.ac.Multi1c2.phase.A.realPower',
      'electrical.ac.Multi1c2.phase.A.current'
    ])
  })

  it('uses the upper and lower device instance', function () {
    const mapper = new N2kMapper()
    mapper.toDelta(claim(1, 1))
    mapper.toDelta(productInfo('Multi'))
    paths(mapper, power(0)).should.include(
      'electrical.ac.Multi9.phase.A.current'
    )
  })

  it('writes a valid tree', function () {
    const delta: any = knownMapper('Skylla-i 24/80').toDelta(power(0))
    delta.context = 'vessels.' + signalkSchema.fakeMmsiId
    signalkSchema.deltaToFull(delta).vessels[signalkSchema.fakeMmsiId].should.be
      .validSignalKVesselIgnoringIdentity
  })

  it('writes nothing before the product information', function () {
    const mapper = new N2kMapper()
    mapper.toDelta(claim(1, 0))
    paths(mapper, power(0)).should.deep.equal([])
  })

  it('writes nothing before the address claim', function () {
    const mapper = new N2kMapper()
    mapper.toDelta(productInfo('Multi'))
    paths(mapper, power(0)).should.deep.equal([])
  })

  it('writes nothing for a model without a letter or digit', function () {
    paths(knownMapper(' - '), power(0)).should.deep.equal([])
    paths(knownMapper(undefined), power(0)).should.deep.equal([])
  })

  it('writes nothing for a frame without a connection number', function () {
    paths(knownMapper('Multi'), power()).should.deep.equal([])
  })

  it('forgets the model when another device takes the address', function () {
    const mapper = knownMapper('Multi')
    mapper.requestMetaData = () => Promise.resolve()
    mapper.toDelta({
      ...claim(1, 0),
      fields: { ...claim(1, 0).fields, uniqueNumber: 76224 }
    })
    paths(mapper, power(0)).should.deep.equal([])
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
      modelId: 'Multi',
      deviceInstance: 3
    })!.should.equal('electrical.ac.Multi3c1')
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
      mapper.toDelta(claim(1, 0))
      mapper.toDelta(power(0))
      requests.should.deep.equal([[SRC, 126996]])
      time += 9999
      mapper.toDelta(power(0))
      requests.should.have.lengthOf(1)
      time += 1
      mapper.toDelta(power(0))
      requests.should.deep.equal([
        [SRC, 126996],
        [SRC, 126996]
      ])
    })

    it('does not ask without such frames', function () {
      const mapper = listening()
      mapper.toDelta(claim(1, 0))
      time += 60000
      mapper.toDelta(claim(1, 0))
      mapper.toDelta(
        decode(127751, SRC, { connectionNumber: 0, dcVoltage: 12 })
      )
      requests.should.deep.equal([])
    })

    it('stops asking when the device has answered', function () {
      const mapper = listening()
      mapper.toDelta(claim(1, 0))
      mapper.toDelta(power(0))
      mapper.toDelta(productInfo('Multi'))
      time += 10000
      paths(mapper, power(0)).should.not.be.empty
      requests.should.have.lengthOf(1)
    })

    it('does not ask again after an answer that names nothing', function () {
      const mapper = listening()
      mapper.toDelta(claim(1, 0))
      mapper.toDelta(productInfo(' - '))
      time += 10000
      mapper.toDelta(power(0))
      requests.should.deep.equal([])
    })

    it('also asks for a missing address claim', function () {
      const mapper = listening()
      mapper.toDelta(power(0))
      requests.should.deep.equal([
        [SRC, 60928],
        [SRC, 126996]
      ])
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
      mapper.toDelta(claim(1, 0))
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
      mapper.toDelta(claim(1, 0))
      mapper.toDelta(power(0))
      sent.should.deep.equal([{ pgn: 59904, dst: SRC, PGN: 126996 }])
    })
  })
})
