import chai from 'chai'
chai.should()
chai.use(require('@signalk/signalk-schema').chaiModule)
const { expect } = chai

import { defaultPrefix, N2kMapper } from '../dist/n2kMapper'
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
})
