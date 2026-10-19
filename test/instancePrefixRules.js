const chai = require('chai')
chai.Should()
chai.use(require('@signalk/signalk-schema').chaiModule)
const expect = chai.expect
const signalkSchema = require('@signalk/signalk-schema')

const { FromPgn, pgnToActisenseSerialFormat } = require('@canboat/canboatjs')
const {
  N2kMapper,
  deviceIdentity,
  validateInstancePrefixRules
} = require('../dist/n2kMapper')

const parser = new FromPgn({ useCamel: true })
const TIMESTAMP = '2026-09-28T12:00:00.000Z'
const PORT_ENGINE = 'Single Engine or Dual Engine Port'
const ENGINE_ROOM = 3
const EXHAUST_GAS = 14
const OUTSIDE_HUMIDITY = 1
const SRC = 17
// The NAME the address claim below packs to, and the device it identifies.
const CAN_NAME = 'c0fa8200346129bf'
const FUSION = 419
const UNIQUE_NUMBER = 76223
const DEVICE = { manufacturerCode: FUSION, uniqueNumber: UNIQUE_NUMBER }

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

const CLAIM_FIELDS = {
  uniqueNumber: UNIQUE_NUMBER,
  manufacturerCode: 'Fusion Electronics',
  deviceInstanceLower: 0,
  deviceInstanceUpper: 0,
  deviceFunction: 130,
  deviceClass: 'Entertainment',
  systemInstance: 0,
  industryGroup: 'Marine',
  arbitraryAddressCapable: 1
}

const addressClaim = (src, fields) => ({
  prio: 6,
  pgn: 60928,
  dst: 255,
  src,
  timestamp: TIMESTAMP,
  fields: { ...CLAIM_FIELDS, Spare: 0, ...fields },
  description: 'ISO Address Claim'
})

const engineSpeed = () =>
  decode(127488, SRC, { instance: PORT_ENGINE, speed: 3000 })

const engineAlarm = () =>
  decode(127489, SRC, {
    instance: PORT_ENGINE,
    temperature: 330,
    discreteStatus1: ['Low Oil Pressure'],
    discreteStatus2: []
  })

const engineRoom = instance =>
  decode(130312, SRC, {
    instance,
    source: 'Engine Room Temperature',
    actualTemperature: 300
  })

const fuelTank = instance =>
  decode(127505, SRC, { instance, type: 'Fuel', level: 50 })

const mainEngine = {
  ...DEVICE,
  group: 'engine',
  instance: 0,
  prefix: 'propulsion.main'
}

// A mapper that has seen the source's address claim.
function claimedMapper (options) {
  const mapper = new N2kMapper(options)
  mapper.toDelta(addressClaim(SRC))
  return mapper
}

function values (mapper, n2k) {
  return mapper.toDelta(n2k).updates[0].values
}

function paths (mapper, n2k) {
  return values(mapper, n2k).map(v => v.path)
}

function vesselTree (delta) {
  delta.context = 'vessels.' + signalkSchema.fakeMmsiId
  return signalkSchema.deltaToFull(delta).vessels[signalkSchema.fakeMmsiId]
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

describe('validateInstancePrefixRules', function () {
  it('accepts valid rules', function () {
    validateInstancePrefixRules([
      mainEngine,
      {
        ...DEVICE,
        group: 'battery',
        instance: 3,
        prefix: 'electrical.batteries.house'
      },
      {
        ...DEVICE,
        group: 'tank',
        discriminator: 0,
        instance: 1,
        prefix: 'tanks.fuel.aft'
      },
      {
        ...DEVICE,
        group: 'temperature',
        discriminator: ENGINE_ROOM,
        instance: 1,
        prefix: 'environment.inside.engineRoomAft.temperature'
      },
      {
        ...DEVICE,
        group: 'humidity',
        discriminator: 0,
        instance: 1,
        prefix: 'environment.inside.cabin.relativeHumidity'
      },
      {
        ...DEVICE,
        group: 'humidity',
        discriminator: OUTSIDE_HUMIDITY,
        instance: 1,
        prefix: 'environment.outside.mast.humidity'
      },
      {
        ...DEVICE,
        group: 'temperature',
        discriminator: EXHAUST_GAS,
        instance: 0,
        prefix: 'propulsion.main.exhaustTemperature'
      },
      {
        ...DEVICE,
        group: 'pressure',
        discriminator: 0,
        instance: 0,
        prefix: 'environment.outside.pressure'
      }
    ]).should.deep.equal([])
    validateInstancePrefixRules([]).should.deep.equal([])
  })

  const NOT_AN_ARRAY = [
    { index: -1, message: 'instance prefix rules must be an array' }
  ]

  ;[
    ['an object', mainEngine],
    ['a string', 'propulsion.main'],
    ['a number', 1]
  ].forEach(([what, rules]) => {
    it(`reports a list that is ${what} at index -1`, function () {
      validateInstancePrefixRules(rules).should.deep.equal(NOT_AN_ARRAY)
    })
  })

  const invalid = [
    ['not an object', null, 'not an object'],
    ['a string', 'propulsion.main', 'not an object'],
    [
      'a manufacturerCode that is not a number',
      { manufacturerCode: 'Fusion Electronics' },
      'manufacturerCode must be an integer in 0..2047'
    ],
    [
      'a missing manufacturerCode',
      { manufacturerCode: undefined },
      'manufacturerCode'
    ],
    [
      'a fractional manufacturerCode',
      { manufacturerCode: 1.5 },
      'manufacturerCode'
    ],
    [
      'a negative manufacturerCode',
      { manufacturerCode: -1 },
      'manufacturerCode'
    ],
    [
      'a manufacturerCode above 2047',
      { manufacturerCode: 2048 },
      'manufacturerCode'
    ],
    [
      'a uniqueNumber that is not a number',
      { uniqueNumber: '76223' },
      'uniqueNumber must be an integer in 0..2097151'
    ],
    ['a missing uniqueNumber', { uniqueNumber: undefined }, 'uniqueNumber'],
    ['a fractional uniqueNumber', { uniqueNumber: 0.5 }, 'uniqueNumber'],
    ['a negative uniqueNumber', { uniqueNumber: -1 }, 'uniqueNumber'],
    [
      'a uniqueNumber above 2^21 - 1',
      { uniqueNumber: 2097152 },
      'uniqueNumber'
    ],
    ['a group that is not a string', { group: 1 }, 'group'],
    ['an unknown group', { group: 'motor' }, 'unknown group "motor"'],
    ['a fractional instance', { instance: 0.5 }, 'instance'],
    ['a string instance', { instance: '0' }, 'instance'],
    ['a negative instance', { instance: -1 }, 'instance'],
    ['an instance above the maximum', { instance: 256 }, 'instance'],
    [
      'a tank instance above 15',
      {
        group: 'tank',
        discriminator: 0,
        instance: 16,
        prefix: 'tanks.fuel.aft'
      },
      'instance'
    ],
    ['a prefix that is not a string', { prefix: 1 }, 'prefix'],
    ['an empty prefix', { prefix: '' }, 'prefix'],
    [
      'a discriminator on a group without one',
      { discriminator: 0 },
      'takes no discriminator'
    ],
    [
      'a tank rule without a discriminator',
      { group: 'tank', instance: 1, prefix: 'tanks.fuel.aft' },
      'needs a discriminator'
    ],
    [
      'a discriminator that is not a number',
      {
        group: 'tank',
        discriminator: 'Fuel',
        instance: 1,
        prefix: 'tanks.fuel.aft'
      },
      'discriminator'
    ],
    [
      'a tank type with no tanks path',
      {
        group: 'tank',
        discriminator: 6,
        instance: 1,
        prefix: 'tanks.fuel.aft'
      },
      'discriminator 6'
    ]
  ]
  invalid.forEach(([what, change, expected]) => {
    it(`reports ${what}`, function () {
      const rule =
        change !== null && typeof change === 'object'
          ? { ...mainEngine, ...change }
          : change
      const problems = validateInstancePrefixRules([rule])
      problems.should.have.lengthOf(1)
      problems[0].index.should.equal(0)
      problems[0].message.should.contain(expected)
    })
  })

  it('names the index of each invalid rule', function () {
    validateInstancePrefixRules([
      mainEngine,
      { ...mainEngine, instance: 1, group: 'motor' },
      { ...mainEngine, instance: 2 },
      { ...mainEngine, instance: 3, prefix: '' }
    ])
      .map(p => p.index)
      .should.deep.equal([1, 3])
  })

  it('reports a rule with the key of an earlier one', function () {
    const problems = validateInstancePrefixRules([
      mainEngine,
      { ...mainEngine, prefix: 'propulsion.center' },
      { ...mainEngine, uniqueNumber: UNIQUE_NUMBER + 1 },
      { ...mainEngine, manufacturerCode: FUSION + 1 },
      {
        ...DEVICE,
        group: 'tank',
        discriminator: 0,
        instance: 0,
        prefix: 'tanks.fuel.aft'
      },
      {
        ...DEVICE,
        group: 'tank',
        discriminator: 1,
        instance: 0,
        prefix: 'tanks.freshWater.aft'
      }
    ])
    problems.should.have.lengthOf(1)
    problems[0].index.should.equal(1)
    problems[0].message.should.contain('rule 0')
  })

  it('accepts the bounds of the device key', function () {
    validateInstancePrefixRules([
      { ...mainEngine, manufacturerCode: 0, uniqueNumber: 0 },
      { ...mainEngine, manufacturerCode: 2047, uniqueNumber: 2097151 }
    ]).should.deep.equal([])
  })

  it('reports a rule keyed by canName instead of the device key', function () {
    const { manufacturerCode, uniqueNumber, ...rest } = mainEngine
    validateInstancePrefixRules([{ ...rest, canName: CAN_NAME }])
      .map(p => p.message)
      .should.deep.equal([
        'manufacturerCode must be an integer in 0..2047',
        'uniqueNumber must be an integer in 0..2097151'
      ])
  })
})

describe('instance prefix rules', function () {
  it('maps a device by its key once its address claim is seen', function () {
    const mapper = new N2kMapper({ instancePrefixRules: [mainEngine] })
    const before = mapper.toDelta(engineSpeed())
    mapper.toDelta(addressClaim(SRC))
    const after = mapper.toDelta(engineSpeed())

    const beforeTree = vesselTree(before)
    beforeTree.should.have.nested.property('propulsion.port.revolutions.value')
    beforeTree.should.not.have.nested.property('propulsion.main')
    beforeTree.should.be.validSignalKVesselIgnoringIdentity

    after.updates[0].source.canName.should.equal(CAN_NAME)
    after.updates[0].values.should.deep.equal([
      {
        path: 'propulsion.main.revolutions',
        value: before.updates[0].values[0].value
      }
    ])
    const afterTree = vesselTree(after)
    afterTree.should.not.have.nested.property('propulsion.port')
    afterTree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('matches a claim as canboatjs decodes it', function () {
    const mapper = new N2kMapper({ instancePrefixRules: [mainEngine] })
    const claim = decode(60928, SRC, CLAIM_FIELDS)
    claim.fields.manufacturerCode.should.equal('Fusion Electronics')
    mapper.toDelta(claim)
    const delta = mapper.toDelta(engineSpeed())
    // canboatjs decodes the reserved bit as 1: another NAME, the same device.
    delta.updates[0].source.canName.should.not.equal(CAN_NAME)
    delta.updates[0].values
      .map(v => v.path)
      .should.deep.equal(['propulsion.main.revolutions'])
  })

  it('keeps matching a device that re-claims with other instances', function () {
    const mapper = claimedMapper({ instancePrefixRules: [mainEngine] })
    const changes = []
    mapper.on('n2kSourceChanged', (src, from, to) => changes.push([from, to]))
    mapper.toDelta(
      addressClaim(SRC, { deviceInstanceLower: 3, systemInstance: 2 })
    )
    changes.should.have.lengthOf(1)
    changes[0][0].should.equal(CAN_NAME)
    paths(mapper, engineSpeed()).should.deep.equal([
      'propulsion.main.revolutions'
    ])
  })

  it('stops matching when another device claims the address', function () {
    const mapper = claimedMapper({ instancePrefixRules: [mainEngine] })
    const changes = []
    mapper.on('n2kSourceChanged', (src, from, to) => changes.push([from, to]))
    mapper.toDelta(addressClaim(SRC, { uniqueNumber: UNIQUE_NUMBER + 1 }))
    changes.should.have.lengthOf(1)
    paths(mapper, engineSpeed()).should.deep.equal([
      'propulsion.port.revolutions'
    ])
  })

  it('maps every path of a frame, notifications included', function () {
    const mapper = claimedMapper({ instancePrefixRules: [mainEngine] })
    const delta = mapper.toDelta(engineAlarm())
    const expected = values(new N2kMapper(), engineAlarm()).map(v =>
      v.path.replace('propulsion.port', 'propulsion.main')
    )
    delta.updates[0].values.map(v => v.path).should.have.members(expected)
    const alarm = delta.updates[0].values.find(
      v => v.path === 'notifications.propulsion.main.lowOilPressure'
    )
    alarm.value.state.should.equal('alarm')
    alarm.value.message.should.contain('Main')
    const tree = vesselTree(delta)
    tree.should.have.nested.property('propulsion.main.temperature.value', 330)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('leaves other devices, instances and groups at the default', function () {
    const mapper = claimedMapper({
      instancePrefixRules: [
        { ...mainEngine, uniqueNumber: UNIQUE_NUMBER + 1 },
        { ...mainEngine, instance: 1 },
        { ...mainEngine, group: 'battery' }
      ]
    })
    paths(mapper, engineSpeed()).should.deep.equal([
      'propulsion.port.revolutions'
    ])
  })

  it('matches a tank by type and instance', function () {
    const mapper = claimedMapper({
      instancePrefixRules: [
        {
          ...DEVICE,
          group: 'tank',
          discriminator: 0,
          instance: 1,
          prefix: 'tanks.fuel.aft'
        },
        {
          ...DEVICE,
          group: 'tank',
          discriminator: 1,
          instance: 2,
          prefix: 'tanks.freshWater.bow'
        }
      ]
    })
    const frame = fuelTank(1)
    const delta = mapper.toDelta(frame)
    delta.updates[0].values.should.deep.equal([
      { path: 'tanks.fuel.aft.currentLevel', value: frame.fields.level }
    ])
    vesselTree(delta).should.be.validSignalKVesselIgnoringIdentity
    paths(mapper, fuelTank(2)).should.deep.equal(['tanks.fuel.2.currentLevel'])
  })

  it('matches a temperature by source and instance', function () {
    const mapper = claimedMapper({
      instancePrefixRules: [
        {
          ...DEVICE,
          group: 'temperature',
          discriminator: ENGINE_ROOM,
          instance: 1,
          prefix: 'environment.inside.engineRoomAft.temperature'
        }
      ]
    })
    const delta = mapper.toDelta(engineRoom(1))
    delta.updates[0].values.should.deep.equal([
      { path: 'environment.inside.engineRoomAft.temperature', value: 300 }
    ])
    vesselTree(delta).should.be.validSignalKVesselIgnoringIdentity
    values(mapper, engineRoom(0)).should.deep.equal([
      { path: 'environment.inside.engineRoom.temperature', value: 300 }
    ])
  })

  it('writes a temperature to a leaf other than its default one', function () {
    const mapper = claimedMapper({
      instancePrefixRules: [
        {
          ...DEVICE,
          group: 'temperature',
          discriminator: ENGINE_ROOM,
          instance: 1,
          prefix: 'propulsion.port.coolantTemperature'
        }
      ]
    })
    const delta = mapper.toDelta(engineRoom(1))
    delta.updates[0].values.should.deep.equal([
      { path: 'propulsion.port.coolantTemperature', value: 300 }
    ])
    vesselTree(delta).should.be.validSignalKVesselIgnoringIdentity
  })

  it('takes a rule over the resolver and asks the resolver otherwise', function () {
    const calls = []
    const mapper = claimedMapper({
      instancePrefixRules: [mainEngine],
      instancePrefixResolver: ctx => {
        calls.push(ctx.instance)
        return 'propulsion.center'
      }
    })
    paths(mapper, engineSpeed()).should.deep.equal([
      'propulsion.main.revolutions'
    ])
    calls.should.deep.equal([])
    paths(
      mapper,
      decode(127488, SRC, { instance: 'Dual Engine Starboard', speed: 3000 })
    ).should.deep.equal(['propulsion.center.revolutions'])
    calls.should.deep.equal([1])
  })

  it('asks the resolver before the address claim is seen', function () {
    const calls = []
    const mapper = new N2kMapper({
      instancePrefixRules: [mainEngine],
      instancePrefixResolver: ctx => {
        calls.push(ctx.canName)
      }
    })
    paths(mapper, engineSpeed()).should.deep.equal([
      'propulsion.port.revolutions'
    ])
    calls.should.deep.equal([undefined])
  })

  it('consults rules and resolver once per frame', function () {
    let calls = 0
    const mapper = claimedMapper({
      instancePrefixRules: [{ ...mainEngine, instance: 1 }],
      instancePrefixResolver: () => {
        calls++
      }
    })
    values(mapper, engineAlarm()).length.should.be.above(1)
    calls.should.equal(1)
  })

  describe('setInstancePrefixRules', function () {
    it('sets, replaces and clears the rules', function () {
      const mapper = claimedMapper()
      paths(mapper, engineSpeed()).should.deep.equal([
        'propulsion.port.revolutions'
      ])
      mapper.setInstancePrefixRules([mainEngine]).should.deep.equal([])
      paths(mapper, engineSpeed()).should.deep.equal([
        'propulsion.main.revolutions'
      ])
      mapper.setInstancePrefixRules([
        { ...mainEngine, prefix: 'propulsion.center' }
      ])
      paths(mapper, engineSpeed()).should.deep.equal([
        'propulsion.center.revolutions'
      ])
      mapper.setInstancePrefixRules([])
      paths(mapper, engineSpeed()).should.deep.equal([
        'propulsion.port.revolutions'
      ])
      mapper.setInstancePrefixRules([mainEngine])
      mapper.setInstancePrefixRules(undefined)
      paths(mapper, engineSpeed()).should.deep.equal([
        'propulsion.port.revolutions'
      ])
    })

    it('keeps the resolver when the rules change', function () {
      const mapper = claimedMapper({
        instancePrefixResolver: () => 'propulsion.center'
      })
      mapper.setInstancePrefixRules([mainEngine])
      mapper.setInstancePrefixRules(undefined)
      paths(mapper, engineSpeed()).should.deep.equal([
        'propulsion.center.revolutions'
      ])
    })

    it("does not log the resolver's throws again when the rules change", function () {
      const mapper = claimedMapper({
        instancePrefixResolver: () => {
          throw new Error('boom')
        }
      })
      const { logged } = quietly(() => {
        values(mapper, engineSpeed())
        mapper.setInstancePrefixRules([{ ...mainEngine, instance: 1 }])
        values(mapper, engineSpeed())
        mapper.setInstancePrefixRules(undefined)
        values(mapper, engineSpeed())
      })
      logged.should.have.lengthOf(1)
      logged[0].should.contain('boom')
    })

    it('applies the valid rules and logs each problem once', function () {
      const mapper = claimedMapper()
      const rules = [
        { ...mainEngine, group: 'motor' },
        mainEngine,
        { ...mainEngine, prefix: 'propulsion.center' }
      ]
      const { result, logged } = quietly(() =>
        mapper.setInstancePrefixRules(rules)
      )
      result.map(p => p.index).should.deep.equal([0, 2])
      logged.should.have.lengthOf(2)
      logged[0].should.contain('rule 0')
      logged[0].should.contain('unknown group "motor"')
      logged[1].should.contain('rule 2')
      const { logged: frameLog } = quietly(() =>
        paths(mapper, engineSpeed()).should.deep.equal([
          'propulsion.main.revolutions'
        ])
      )
      frameLog.should.deep.equal([])
    })

    it('applies the constructor option through the setter', function () {
      const { result: mapper, logged } = quietly(() =>
        claimedMapper({
          instancePrefixRules: [mainEngine, { ...mainEngine, instance: 300 }]
        })
      )
      logged.should.have.lengthOf(1)
      logged[0].should.contain('rule 1')
      paths(mapper, engineSpeed()).should.deep.equal([
        'propulsion.main.revolutions'
      ])
    })
    ;[
      ['an object', mainEngine],
      ['a string', 'propulsion.main'],
      ['a number', 1]
    ].forEach(([what, rules]) => {
      it(`reports and clears rules given ${what}`, function () {
        const mapper = claimedMapper({ instancePrefixRules: [mainEngine] })
        const { result, logged } = quietly(() =>
          mapper.setInstancePrefixRules(rules)
        )
        result.should.deep.equal([
          { index: -1, message: 'instance prefix rules must be an array' }
        ])
        logged.should.have.lengthOf(1)
        logged[0].should.contain('must be an array')
        paths(mapper, engineSpeed()).should.deep.equal([
          'propulsion.port.revolutions'
        ])
      })

      it(`constructs a mapper given ${what} as the option`, function () {
        const { result: mapper, logged } = quietly(() =>
          claimedMapper({ instancePrefixRules: rules })
        )
        logged.should.have.lengthOf(1)
        paths(mapper, engineSpeed()).should.deep.equal([
          'propulsion.port.revolutions'
        ])
      })
    })

    it('clears the rules given null', function () {
      const mapper = claimedMapper({ instancePrefixRules: [mainEngine] })
      mapper.setInstancePrefixRules(null).should.deep.equal([])
      paths(mapper, engineSpeed()).should.deep.equal([
        'propulsion.port.revolutions'
      ])
    })

    it('copies the rules it is given', function () {
      const rule = { ...mainEngine }
      const mapper = claimedMapper({ instancePrefixRules: [rule] })
      rule.prefix = 'propulsion.center'
      paths(mapper, engineSpeed()).should.deep.equal([
        'propulsion.main.revolutions'
      ])
    })
  })
})

describe('deviceIdentity', function () {
  it('decodes the device key of a canName', function () {
    deviceIdentity(CAN_NAME).should.deep.equal(DEVICE)
    deviceIdentity('ffe00001').should.deep.equal({
      manufacturerCode: 2047,
      uniqueNumber: 1
    })
    deviceIdentity('1').should.deep.equal({
      manufacturerCode: 0,
      uniqueNumber: 1
    })
  })

  it('returns undefined for a value that is not a canName', function () {
    ;['', 'not a name', '1'.repeat(17), 17, undefined, null].forEach(value =>
      expect(deviceIdentity(value)).to.equal(undefined)
    )
  })

  it('keys a rule that matches the device the delta names', function () {
    const mapper = new N2kMapper()
    mapper.toDelta(decode(60928, SRC, CLAIM_FIELDS))
    const { canName } = mapper.toDelta(engineSpeed()).updates[0].source
    mapper.setInstancePrefixRules([
      { ...mainEngine, ...deviceIdentity(canName) }
    ])
    paths(mapper, engineSpeed()).should.deep.equal([
      'propulsion.main.revolutions'
    ])
  })
})
