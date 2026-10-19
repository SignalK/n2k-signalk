const chai = require('chai')
chai.Should()
chai.use(require('@signalk/signalk-schema').chaiModule)
const expect = chai.expect
const signalkSchema = require('@signalk/signalk-schema')

const { FromPgn, pgnToActisenseSerialFormat } = require('@canboat/canboatjs')
const { N2kMapper, toDelta } = require('../dist/n2kMapper')
const { RESOLVER } = require('../dist/instanceGroups')

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

const engineAlarmFrom = src =>
  decode(127489, src, {
    instance: PORT_ENGINE,
    temperature: 330,
    discreteStatus1: ['Low Oil Pressure'],
    discreteStatus2: []
  })

const engineAlarm = engineAlarmFrom(17)

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

// The values the default mapper writes for the frame, moved from one prefix
// to another.
function moved (n2k, from, to) {
  return values(new N2kMapper(), n2k).map(v => ({
    path: v.path.replace(from, to),
    value: v.value
  }))
}

function quietly (fn) {
  const logged = []
  const consoleError = console.error
  console.error = (...args) => logged.push(args.join(' '))
  try {
    return { result: fn(), logged }
  } finally {
    console.error = consoleError
  }
}

function vesselTree (delta) {
  delta.context = 'vessels.' + signalkSchema.fakeMmsiId
  return signalkSchema.deltaToFull(delta).vessels[signalkSchema.fakeMmsiId]
}

// Maps the frame, checks it writes the default values under target, and
// returns the vessel tree.
function expectMoved (mapper, n2k, from, to) {
  const delta = mapper.toDelta(n2k)
  const expected = moved(n2k, from, to)
  expected.should.not.be.empty
  delta.updates[0].values.should.deep.equal(expected)
  return vesselTree(delta)
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
    const frame = engineSpeed(PORT_ENGINE)
    const tree = expectMoved(
      mapper,
      frame,
      'propulsion.port',
      'propulsion.main'
    )
    tree.should.have.nested.property(
      'propulsion.main.revolutions.value',
      frame.fields.speed
    )
    tree.should.not.have.nested.property('propulsion.port')
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('maps engine alarms and names the engine by its mapped id', function () {
    const mapper = new N2kMapper({
      instancePrefixResolver: rule('engine', 0, 'propulsion.main')
    })
    const delta = mapper.toDelta(engineAlarm)
    const alarm = delta.updates[0].values.find(
      v => v.path === 'notifications.propulsion.main.lowOilPressure'
    )
    expect(alarm).to.not.equal(undefined)
    alarm.value.state.should.equal('alarm')
    alarm.value.message.should.not.contain('Port')
    alarm.value.message.should.contain('Main')
    delta.updates[0].values
      .map(v => v.path)
      .should.have.members(
        moved(engineAlarm, 'propulsion.port', 'propulsion.main').map(
          v => v.path
        )
      )
    const tree = vesselTree(delta)
    tree.should.have.nested.property('propulsion.main.temperature.value', 330)
    tree.should.be.validSignalKVesselIgnoringIdentity
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
    const frame = engineSpeed(PORT_ENGINE)
    // generator is not in the Signal K 1.3.1 schema the tests validate with.
    expectMoved(
      mapper,
      frame,
      'propulsion.port',
      'generator.genset'
    ).should.have.nested.property(
      'generator.genset.revolutions.value',
      frame.fields.speed
    )
  })

  it('maps battery 3 to electrical.batteries.house', function () {
    const mapper = new N2kMapper({
      instancePrefixResolver: rule('battery', 3, 'electrical.batteries.house')
    })
    const tree = expectMoved(
      mapper,
      battery(3),
      'electrical.batteries.3',
      'electrical.batteries.house'
    )
    tree.should.have.nested.property(
      'electrical.batteries.house.voltage.value',
      13.1
    )
    tree.should.have.nested.property(
      'electrical.batteries.house.current.value',
      5.6
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('maps tank Fuel 1 to tanks.freshWater.aft', function () {
    const mapper = new N2kMapper({
      instancePrefixResolver: rule('tank', 1, 'tanks.freshWater.aft', 0)
    })
    const frame = decode(127505, 17, { instance: 1, type: 'Fuel', level: 50 })
    const tree = expectMoved(
      mapper,
      frame,
      'tanks.fuel.1',
      'tanks.freshWater.aft'
    )
    tree.should.have.nested.property(
      'tanks.freshWater.aft.currentLevel.value',
      frame.fields.level
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
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
    const tree = expectMoved(
      mapper,
      engineRoom(1),
      'environment.inside.engineRoom.temperature',
      'environment.inside.engineRoomAft.temperature'
    )
    tree.should.have.nested.property(
      'environment.inside.engineRoomAft.temperature.value',
      300
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
    values(mapper, engineRoom(0)).should.deep.equal([
      { path: 'environment.inside.engineRoom.temperature', value: 300 }
    ])
  })

  it('maps 127751 connection 0 to electrical.solar.roof', function () {
    const mapper = new N2kMapper({
      instancePrefixResolver: rule('dcConnection', 0, 'electrical.solar.roof')
    })
    const tree = expectMoved(
      mapper,
      decode(127751, 34, { connectionNumber: 0, dcVoltage: 14, dcCurrent: 3 }),
      'electrical.dc.34.0',
      'electrical.solar.roof'
    )
    tree.should.have.nested.property('electrical.solar.roof.voltage.value', 14)
    tree.should.have.nested.property('electrical.solar.roof.current.value', 3)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('passes numeric codes, src and the device once 60928 is seen', function () {
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
      canName: undefined,
      manufacturerCode: undefined,
      uniqueNumber: undefined
    })
    calls
      .slice(0, beforeClaim)
      .forEach(c => expect(c.canName).to.equal(undefined))
    calls.slice(beforeClaim).forEach(c => {
      c.canName.should.equal(CAN_NAME)
      c.manufacturerCode.should.equal(419)
      c.uniqueNumber.should.equal(76223)
    })
    calls.length.should.be.above(beforeClaim)
  })

  it('reads the device from the source state canName', function () {
    const calls = []
    const resolver = ctx => {
      calls.push([ctx.manufacturerCode, ctx.uniqueNumber])
    }
    const state = { 17: { canName: 'c0fa8200346129bf' } }
    toDelta(engineSpeed(PORT_ENGINE), state, {}, resolver)
    state['17'].canName = 'ffe00001'
    toDelta(engineSpeed(PORT_ENGINE), state, {}, resolver)
    state['17'].canName = 'not a name'
    toDelta(engineSpeed(PORT_ENGINE), state, {}, resolver)
    calls.should.deep.equal([
      [419, 76223],
      [2047, 1],
      [undefined, undefined]
    ])
    Object.keys(state['17']).should.deep.equal(['canName'])
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

  describe('setInstancePrefixResolver', function () {
    it('sets, replaces and clears the resolver', function () {
      const mapper = new N2kMapper()
      paths(mapper, engineSpeed(PORT_ENGINE)).should.deep.equal([
        'propulsion.port.revolutions'
      ])
      mapper.setInstancePrefixResolver(rule('engine', 0, 'propulsion.main'))
      paths(mapper, engineSpeed(PORT_ENGINE)).should.deep.equal([
        'propulsion.main.revolutions'
      ])
      mapper.setInstancePrefixResolver(rule('engine', 0, 'propulsion.center'))
      paths(mapper, engineSpeed(PORT_ENGINE)).should.deep.equal([
        'propulsion.center.revolutions'
      ])
      mapper.setInstancePrefixResolver(undefined)
      paths(mapper, engineSpeed(PORT_ENGINE)).should.deep.equal([
        'propulsion.port.revolutions'
      ])
    })

    it('stops calling a cleared resolver', function () {
      let calls = 0
      const mapper = new N2kMapper({
        instancePrefixResolver: () => {
          calls++
        }
      })
      mapper.toDelta(engineSpeed(PORT_ENGINE))
      calls.should.equal(1)
      mapper.setInstancePrefixResolver(undefined)
      mapper.toDelta(engineSpeed(PORT_ENGINE))
      calls.should.equal(1)
    })

    it('reads the constructor option once', function () {
      const options = {
        instancePrefixResolver: rule('engine', 0, 'propulsion.main')
      }
      const mapper = new N2kMapper(options)
      delete options.instancePrefixResolver
      paths(mapper, engineSpeed(PORT_ENGINE)).should.deep.equal([
        'propulsion.main.revolutions'
      ])
      options.instancePrefixResolver = rule('engine', 0, 'propulsion.center')
      paths(mapper, engineSpeed(PORT_ENGINE)).should.deep.equal([
        'propulsion.main.revolutions'
      ])
    })

    it("logs a replacing resolver's throws again", function () {
      const throwing = message => () => {
        throw new Error(message)
      }
      const mapper = new N2kMapper()
      mapper.setInstancePrefixResolver(throwing('first'))
      const { logged } = quietly(() => {
        values(mapper, engineAlarm)
        values(mapper, engineAlarm)
        mapper.setInstancePrefixResolver(throwing('second'))
        values(mapper, engineAlarm)
        values(mapper, engineAlarm)
      })
      logged.should.have.lengthOf(2)
      logged[0].should.contain('first')
      logged[1].should.contain('second')
    })

    it("does not log a re-set resolver's throws again", function () {
      const throwing = () => {
        throw new Error('boom')
      }
      const mapper = new N2kMapper({ instancePrefixResolver: throwing })
      const { logged } = quietly(() => {
        values(mapper, engineAlarm)
        mapper.setInstancePrefixResolver(throwing)
        values(mapper, engineAlarm)
      })
      logged.should.have.lengthOf(1)
    })

    it('logs throws per mapper when mappers share a resolver', function () {
      const throwing = () => {
        throw new Error('boom')
      }
      const first = new N2kMapper({ instancePrefixResolver: throwing })
      const second = new N2kMapper({ instancePrefixResolver: throwing })
      const { logged } = quietly(() => {
        values(first, engineAlarm)
        values(second, engineAlarm)
        values(first, engineAlarm)
        values(second, engineAlarm)
      })
      logged.should.have.lengthOf(2)
    })

    it('rejects a resolver that is not a function', function () {
      expect(() =>
        new N2kMapper().setInstancePrefixResolver('propulsion.main')
      ).to.throw(TypeError)
    })
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

  it('calls a throwing resolver once per frame and writes default paths', function () {
    let calls = 0
    const mapper = new N2kMapper({
      instancePrefixResolver: () => {
        calls++
        throw new Error('boom')
      }
    })
    const { result, logged } = quietly(() =>
      [1, 2, 3].map(() => values(mapper, engineAlarm))
    )
    const expected = values(new N2kMapper(), engineAlarm)
    expected.length.should.be.above(1)
    result.forEach(frameValues => frameValues.should.deep.equal(expected))
    calls.should.equal(3)
    logged.should.have.lengthOf(1)
    logged[0].should.contain('pgn 127489')
    logged[0].should.contain('src 17')
    logged[0].should.contain('boom')

    const { logged: otherSource } = quietly(() => {
      values(mapper, engineAlarmFrom(18))
      values(mapper, engineAlarmFrom(18))
    })
    otherSource.should.have.lengthOf(1)
    otherSource[0].should.contain('src 18')
  })

  it('binds the resolver only for frames of instance PGNs', function () {
    const mapper = new N2kMapper({
      instancePrefixResolver: () => 'propulsion.main'
    })
    const position = decode(129025, 17, { latitude: 60.1, longitude: 24.9 })
    mapper.toDelta(position)
    Object.getOwnPropertySymbols(mapper.state['17']).should.be.empty
    mapper.toDelta(engineSpeed(PORT_ENGINE))
    expect(mapper.state['17'][RESOLVER]).to.not.equal(undefined)
    mapper.toDelta(position)
    expect(mapper.state['17'][RESOLVER]).to.equal(undefined)
  })

  it('appends the phase to a resolved AC connection prefix', function () {
    const mapper = new N2kMapper({
      instancePrefixResolver: rule('acConnection', 1, 'electrical.ac.shore')
    })
    // The 1.3.1 schema has no electrical.ac phase paths, default or not.
    values(mapper, acPhaseB(1)).should.have.deep.members([
      { path: 'electrical.ac.shore.phase.B.power', value: 120 },
      { path: 'electrical.ac.shore.phase.B.current', value: 11 }
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
