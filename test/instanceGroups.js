const chai = require('chai')
chai.Should()
const expect = chai.expect

const { FromPgn, pgnToActisenseSerialFormat } = require('@canboat/canboatjs')
const {
  N2kMapper,
  instanceGroups,
  classifyInstance,
  defaultPrefix
} = require('../dist/n2kMapper')

const parser = new FromPgn({ useCamel: true })
const TIMESTAMP = '2026-09-28T12:00:00.000Z'

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

function mappedPaths (n2k) {
  return new N2kMapper().toDelta(n2k).updates[0].values.map(v => v.path)
}

function isAtOrUnder (path, prefix) {
  return path === prefix || path.startsWith(prefix + '.')
}

function prefixOf (n2k) {
  const c = classifyInstance(n2k)
  expect(c, `classification of ${n2k.pgn}`).to.not.equal(undefined)
  return defaultPrefix(c.group, c.discriminator, c.instance, n2k.src, n2k.pgn)
}

const acLine = {
  line: 'Line 1',
  voltage: 230,
  current: 2,
  frequency: 50
}

const FRAMES = [
  [
    127488,
    {
      instance: 'Single Engine or Dual Engine Port',
      speed: 3000,
      boostPressure: 100000,
      tiltTrim: 10
    }
  ],
  [
    127489,
    {
      instance: 'Dual Engine Starboard',
      temperature: 350,
      oilPressure: 300000,
      discreteStatus1: ['Low Oil Pressure'],
      discreteStatus2: ['Warning Level 1']
    }
  ],
  [
    127493,
    {
      instance: 2,
      transmissionGear: 'Forward',
      oilPressure: 100000,
      oilTemperature: 320,
      discreteStatus1: ['Over Temperature']
    }
  ],
  [127497, { tripFuelUsed: 100, fuelRateAverage: 5 }],
  [127503, { instance: 1, numberOfLines: 1, list: [acLine] }],
  [127504, { instance: 2, numberOfLines: 1, list: [acLine] }],
  [127505, { instance: 1, type: 'Fuel', level: 50, capacity: 200 }],
  [127506, { instance: 3, stateOfCharge: 80, stateOfHealth: 90 }],
  [127507, { instance: 0, batteryInstance: 0, operatingState: 'Bulk' }],
  [127508, { instance: 3, voltage: 12.5, current: 1.5, temperature: 300 }],
  [127509, { instance: 0, acInstance: 0, dcInstance: 0, inverterEnable: 'On' }],
  [127510, { instance: 1, batteryInstance: 0, chargeCurrentLimit: 20 }],
  [127511, { instance: 0, batteryInstance: 0, inverterEnableDisable: 'On' }],
  [127513, { instance: 3, capacity: 100, peukertExponent: 1.2 }],
  [127744, { connectionNumber: 0, acRmsCurrent: 3, power: 100 }],
  [127745, { connectionNumber: 1, acRmsCurrent: 3, power: 100 }],
  [127746, { connectionNumber: 2, acRmsCurrent: 3, power: 100 }],
  [127750, { connectionNumber: 1, operatingState: 'Invert' }],
  [127751, { connectionNumber: 0, dcVoltage: 13.2, dcCurrent: 4 }],
  [
    130312,
    { instance: 0, source: 'Engine Room Temperature', actualTemperature: 330 }
  ],
  [
    130312,
    { instance: 4, source: 'Shaft Seal Temperature', actualTemperature: 330 }
  ],
  [130312, { instance: 2, source: 'Inside Temperature', actualTemperature: 1 }],
  [130313, { instance: 1, source: 'Inside', actualHumidity: 40 }],
  [130313, { instance: 0, source: 'Outside', actualHumidity: 60 }],
  [130314, { instance: 0, source: 'Oil', pressure: 300000 }],
  [130314, { instance: 0, source: 'Atmospheric', pressure: 101300 }],
  [
    130316,
    { instance: 1, source: 'Exhaust Gas Temperature', temperature: 700 }
  ],
  [130316, { instance: 4, source: 'Shaft Seal Temperature', temperature: 330 }]
]

describe('instance groups', function () {
  it('covers every PGN the representative frames exercise', function () {
    const tablePgns = instanceGroups.flatMap(g => g.pgns).sort()
    const framePgns = [...new Set(FRAMES.map(([pgn]) => pgn))].sort()
    framePgns.should.deep.equal(tablePgns)
  })

  FRAMES.forEach(([pgn, fields]) => {
    it(`${pgn} ${JSON.stringify(
      fields
    )} writes under its default prefix`, function () {
      const n2k = decode(pgn, 34, fields)
      const group = instanceGroups.find(g => g.pgns.includes(pgn))
      const prefix = prefixOf(n2k)
      const paths = mappedPaths(n2k)
      paths.should.not.be.empty
      paths.forEach(path => {
        if (group.singleLeaf) {
          path.should.equal(prefix)
        } else {
          const underPrefix =
            isAtOrUnder(path, prefix) ||
            isAtOrUnder(path, 'notifications.' + prefix)
          underPrefix.should.equal(true, `${path} under ${prefix}`)
        }
      })
    })
  })

  describe('engine', function () {
    const cases = [
      ['Single Engine or Dual Engine Port', 0, 'propulsion.port'],
      ['Dual Engine Starboard', 1, 'propulsion.starboard'],
      [2, 2, 'propulsion.2'],
      [undefined, 255, 'propulsion.starboard']
    ]
    cases.forEach(([field, code, prefix]) => {
      it(`instance ${field} is code ${code} at ${prefix}`, function () {
        const n2k = decode(127488, 1, { instance: field, speed: 600 })
        classifyInstance(n2k).should.deep.equal({
          group: 'engine',
          discriminator: undefined,
          instance: code
        })
        defaultPrefix('engine', undefined, code, 1).should.equal(prefix)
        mappedPaths(n2k).should.deep.equal([prefix + '.revolutions'])
      })
    })

    it('classifies a null instance as absent', function () {
      classifyInstance({
        pgn: 127488,
        src: 1,
        fields: { instance: null }
      }).instance.should.equal(255)
    })
  })

  it('battery 3 is electrical.batteries.3', function () {
    defaultPrefix('battery', undefined, 3, 1).should.equal(
      'electrical.batteries.3'
    )
  })

  it('127751 from src 34, connection 0 is electrical.dc.34.0', function () {
    const n2k = decode(127751, 34, { connectionNumber: 0, dcVoltage: 12 })
    classifyInstance(n2k).should.deep.equal({
      group: 'dcConnection',
      discriminator: undefined,
      instance: 0
    })
    defaultPrefix('dcConnection', undefined, 0, 34).should.equal(
      'electrical.dc.34.0'
    )
  })

  it('tank type is a discriminator code', function () {
    const n2k = decode(127505, 1, { instance: 1, type: 'Water', level: 10 })
    classifyInstance(n2k).should.deep.equal({
      group: 'tank',
      discriminator: 1,
      instance: 1
    })
    defaultPrefix('tank', 1, 1, 1).should.equal('tanks.freshWater.1')
  })

  it('returns nothing for PGNs outside the table', function () {
    ;[129025, 127501, 127245].forEach(pgn => {
      expect(
        classifyInstance({ pgn, src: 1, fields: { instance: 0 } })
      ).to.equal(undefined)
    })
  })

  it('returns nothing for a 130312 frame without a source', function () {
    const n2k = decode(130312, 1, { instance: 0, actualTemperature: 300 })
    expect(classifyInstance(n2k)).to.equal(undefined)
  })

  it('Engine Room instances 0 and 1 share one path', function () {
    const [first, second] = [0, 1].map(instance =>
      decode(130312, 1, {
        instance,
        source: 'Engine Room Temperature',
        actualTemperature: 330
      })
    )
    classifyInstance(first).should.deep.equal({
      group: 'temperature',
      discriminator: 3,
      instance: 0
    })
    classifyInstance(second).should.deep.equal({
      group: 'temperature',
      discriminator: 3,
      instance: 1
    })
    prefixOf(first).should.equal('environment.inside.engineRoom.temperature')
    prefixOf(second).should.equal('environment.inside.engineRoom.temperature')
  })

  it('spells unmapped temperature sources per PGN', function () {
    defaultPrefix('temperature', 15, 4, 1).should.equal(
      'generic.temperatures.userDefinedShaft_Seal_Temperature.4.temperature'
    )
    defaultPrefix('temperature', 15, 4, 1, 130316).should.equal(
      'generic.temperatures.userDefinedShaft Seal Temperature.4.temperature'
    )
  })

  it('rejects a discriminator mismatch', function () {
    expect(defaultPrefix('battery', 0, 3, 1)).to.equal(undefined)
    expect(defaultPrefix('tank', undefined, 3, 1)).to.equal(undefined)
  })

  it('lists the codes a group writes paths for', function () {
    const pressure = instanceGroups.find(g => g.id === 'pressure')
    ;[...pressure.discriminatorCodes].should.deep.equal([
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ])
    expect(instanceGroups.find(g => g.id === 'engine').discriminatorCodes).to.be
      .undefined
  })
})
