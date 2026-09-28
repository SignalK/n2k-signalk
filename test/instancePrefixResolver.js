const chai = require('chai')
chai.Should()
const expect = chai.expect

const { FromPgn, pgnToActisenseSerialFormat } = require('@canboat/canboatjs')
const { N2kMapper, toDelta } = require('../dist/n2kMapper')

const parser = new FromPgn({ useCamel: true })
const TIMESTAMP = '2026-09-28T12:00:00.000Z'
const PORT_ENGINE = 'Single Engine or Dual Engine Port'
const ENGINE_ROOM = 3
const CAN_NAME = 'c0fa8200346129bf'

// Round-trip through canboatjs so fields arrive as the mapper receives them.
function decode (pgn, src, fields) {
  const parsed = parser.parseString(
    pgnToActisenseSerialFormat({
      timestamp: TIMESTAMP,
      prio: 2,
      src,
      dst: 255,
      pgn,
      fields
    })
  )
  parsed.timestamp = TIMESTAMP
  return parsed
}

const addressClaim = src => ({
  prio: 6,
  pgn: 60928,
  dst: 255,
  src,
  timestamp: TIMESTAMP,
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
  },
  description: 'ISO Address Claim'
})

const engineSpeed = instance => decode(127488, 17, { instance, speed: 3000 })

const engineAlarm = decode(127489, 17, {
  instance: PORT_ENGINE,
  temperature: 330,
  discreteStatus1: ['Low Oil Pressure'],
  discreteStatus2: []
})

const battery = instance =>
  decode(127508, 17, { instance, voltage: 13.1, current: 5.6 })

const engineRoom = instance =>
  decode(130312, 17, {
    instance,
    source: 'Engine Room Temperature',
    actualTemperature: 300
  })

const acPhaseB = connectionNumber =>
  decode(127745, 33, { connectionNumber, acRmsCurrent: 11, power: 120 })

function values (mapper, n2k) {
  return mapper.toDelta(n2k).updates[0].values
}

function paths (mapper, n2k) {
  return values(mapper, n2k).map(v => v.path)
}

// Maps one group/discriminator/instance to target; everything else default.
function rule (group, instance, target, discriminator) {
  return ctx =>
    ctx.group === group &&
    ctx.instance === instance &&
    ctx.discriminator === discriminator
      ? target
      : undefined
}

describe('instancePrefixResolver', function () {
  it('maps engine 0 to propulsion.main', function () {
    const mapper = new N2kMapper({
      instancePrefixResolver: rule('engine', 0, 'propulsion.main')
    })
    paths(mapper, engineSpeed(PORT_ENGINE)).should.include(
      'propulsion.main.revolutions'
    )
  })

  it('maps engine alarms and names the engine by its mapped id', function () {
    const mapper = new N2kMapper({
      instancePrefixResolver: rule('engine', 0, 'propulsion.main')
    })
    const alarm = values(mapper, engineAlarm).find(
      v => v.path === 'notifications.propulsion.main.lowOilPressure'
    )
    expect(alarm).to.not.equal(undefined)
    alarm.value.state.should.equal('alarm')
    alarm.value.message.should.not.contain('Port')
    alarm.value.message.should.contain('Main')
    paths(mapper, engineAlarm).forEach(path =>
      path.should.not.contain('propulsion.port')
    )
  })

  it('keeps the default engine title without a resolver', function () {
    const alarm = values(new N2kMapper(), engineAlarm).find(
      v => v.path === 'notifications.propulsion.port.lowOilPressure'
    )
    alarm.value.message.should.contain('Port')
  })

  it('maps engine 0 to generator.genset', function () {
    const mapper = new N2kMapper({
      instancePrefixResolver: rule('engine', 0, 'generator.genset')
    })
    paths(mapper, engineSpeed(PORT_ENGINE)).should.include(
      'generator.genset.revolutions'
    )
  })

  it('maps battery 3 to electrical.batteries.house', function () {
    const mapper = new N2kMapper({
      instancePrefixResolver: rule('battery', 3, 'electrical.batteries.house')
    })
    paths(mapper, battery(3)).should.include(
      'electrical.batteries.house.voltage'
    )
  })

  it('maps tank Fuel 1 to tanks.freshWater.aft', function () {
    const mapper = new N2kMapper({
      instancePrefixResolver: rule('tank', 1, 'tanks.freshWater.aft', 0)
    })
    paths(
      mapper,
      decode(127505, 17, { instance: 1, type: 'Fuel', level: 50 })
    ).should.include('tanks.freshWater.aft.currentLevel')
  })

  it('maps Engine Room instance 1 and leaves instance 0 at the default', function () {
    const mapper = new N2kMapper({
      instancePrefixResolver: rule(
        'temperature',
        1,
        'environment.inside.engineRoomAft.temperature',
        ENGINE_ROOM
      )
    })
    paths(mapper, engineRoom(1)).should.deep.equal([
      'environment.inside.engineRoomAft.temperature'
    ])
    paths(mapper, engineRoom(0)).should.deep.equal([
      'environment.inside.engineRoom.temperature'
    ])
  })

  it('maps 127751 connection 0 to electrical.solar.roof', function () {
    const mapper = new N2kMapper({
      instancePrefixResolver: rule('dcConnection', 0, 'electrical.solar.roof')
    })
    paths(
      mapper,
      decode(127751, 34, { connectionNumber: 0, dcVoltage: 14, dcCurrent: 3 })
    ).should.have.members([
      'electrical.solar.roof.voltage',
      'electrical.solar.roof.current'
    ])
  })

  it('passes numeric codes, src and canName once 60928 is seen', function () {
    const calls = []
    const mapper = new N2kMapper({
      instancePrefixResolver: ctx => {
        calls.push(ctx)
      }
    })
    const frame = decode(127488, 12, { instance: PORT_ENGINE, speed: 3000 })
    mapper.toDelta(frame)
    const beforeClaim = calls.length
    mapper.toDelta(addressClaim(12))
    mapper.toDelta(frame)

    beforeClaim.should.be.above(0)
    calls[0].should.deep.equal({
      group: 'engine',
      discriminator: undefined,
      instance: 0,
      src: frame.src,
      canName: undefined
    })
    calls
      .slice(0, beforeClaim)
      .forEach(c => expect(c.canName).to.equal(undefined))
    calls.slice(beforeClaim).forEach(c => c.canName.should.equal(CAN_NAME))
    calls.length.should.be.above(beforeClaim)
  })

  it('writes the default path when the resolver returns nothing', function () {
    const mapper = new N2kMapper({ instancePrefixResolver: () => undefined })
    const nullMapper = new N2kMapper({ instancePrefixResolver: () => null })
    const expected = values(new N2kMapper(), engineAlarm)
    values(mapper, engineAlarm).should.deep.equal(expected)
    values(nullMapper, engineAlarm).should.deep.equal(expected)
  })

  it('does not apply a battery 1 rule to battery 10', function () {
    const mapper = new N2kMapper({
      instancePrefixResolver: rule('battery', 1, 'electrical.batteries.house')
    })
    paths(mapper, battery(10)).should.include('electrical.batteries.10.voltage')
    paths(mapper, battery(1)).should.include(
      'electrical.batteries.house.voltage'
    )
  })

  it('does not leak a resolver into another mapper', function () {
    const withResolver = new N2kMapper({
      instancePrefixResolver: rule('engine', 0, 'propulsion.main')
    })
    const without = new N2kMapper()
    const frame = engineSpeed(PORT_ENGINE)
    paths(withResolver, frame).should.include('propulsion.main.revolutions')
    paths(without, frame).should.include('propulsion.port.revolutions')
  })

  it('stops calling a resolver removed from the options', function () {
    let calls = 0
    const options = {
      instancePrefixResolver: () => {
        calls++
      }
    }
    const mapper = new N2kMapper(options)
    mapper.toDelta(engineSpeed(PORT_ENGINE))
    calls.should.be.above(0)
    delete options.instancePrefixResolver
    calls = 0
    paths(mapper, engineSpeed(PORT_ENGINE)).should.include(
      'propulsion.port.revolutions'
    )
    calls.should.equal(0)
  })

  it('calls the resolver once per frame', function () {
    let calls = 0
    const mapper = new N2kMapper({
      instancePrefixResolver: () => {
        calls++
        return 'propulsion.main'
      }
    })
    values(mapper, engineAlarm).length.should.be.above(1)
    calls.should.equal(1)
    mapper.toDelta(engineSpeed(PORT_ENGINE))
    calls.should.equal(2)
  })

  it('appends the phase to a resolved AC connection prefix', function () {
    const mapper = new N2kMapper({
      instancePrefixResolver: rule('acConnection', 1, 'electrical.ac.shore')
    })
    paths(mapper, acPhaseB(1)).should.have.members([
      'electrical.ac.shore.phase.B.power',
      'electrical.ac.shore.phase.B.current'
    ])
  })

  it('writes the default path when the resolver returns an empty string', function () {
    const mapper = new N2kMapper({ instancePrefixResolver: () => '' })
    paths(mapper, acPhaseB(1)).should.have.members([
      'electrical.ac.33.1.phase.B.power',
      'electrical.ac.33.1.phase.B.current'
    ])
  })

  it('keeps the stateless toDelta export working', function () {
    const state = {}
    toDelta(engineSpeed(PORT_ENGINE), state)
      .updates[0].values.map(v => v.path)
      .should.include('propulsion.port.revolutions')
    toDelta(engineSpeed(PORT_ENGINE))
      .updates[0].values.map(v => v.path)
      .should.include('propulsion.port.revolutions')
    Object.keys(state).should.deep.equal(['17'])
    JSON.stringify(state).should.equal('{"17":{}}')
  })
})
