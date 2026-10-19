const chai = require('chai')
chai.Should()
const expect = chai.expect

const {
  N2kMapper,
  instanceGroups,
  classifyInstance,
  defaultPrefix
} = require('../dist/n2kMapper')
const { instancePrefix } = require('../dist/instanceGroups')
const { decode, prefixOf, FRAMES } = require('./instanceFrames')

function mappedPaths (n2k) {
  return new N2kMapper().toDelta(n2k).updates[0].values.map(v => v.path)
}

function isAtOrUnder (path, prefix) {
  return path === prefix || path.startsWith(prefix + '.')
}

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

  it('lists only the tank types 127505 writes', function () {
    const tank = instanceGroups.find(g => g.id === 'tank')
    tank.discriminatorCodes.should.deep.equal([0, 1, 2, 3, 4, 5])
    for (let code = 0; code <= tank.maxInstance; code++) {
      const n2k = decode(127505, 1, { instance: 1, type: code, level: 10 })
      const written = mappedPaths(n2k).length > 0
      written.should.equal(
        tank.discriminatorCodes.includes(code),
        `type ${code}`
      )
      expect(classifyInstance(n2k) !== undefined).to.equal(written)
      expect(defaultPrefix('tank', code, 1, 1) !== undefined).to.equal(written)
    }
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
    // An unmapped source gets a userDefined path; only an absent one has none.
    pressure.discriminatorCodes.should.have.lengthOf(255)
    pressure.discriminatorCodes.should.not.include(255)
    expect(instanceGroups.find(g => g.id === 'engine').discriminatorCodes).to.be
      .undefined
  })

  it('lists the codes sorted, frozen and as JSON keeps them', function () {
    instanceGroups
      .filter(g => g.discriminatorCodes !== undefined)
      .forEach(g => {
        g.discriminatorCodes.should.be.an('array')
        g.discriminatorCodes.should.deep.equal(
          [...g.discriminatorCodes].sort((a, b) => a - b)
        )
        Object.isFrozen(g.discriminatorCodes).should.equal(true)
        JSON.parse(JSON.stringify(g)).discriminatorCodes.should.deep.equal(
          g.discriminatorCodes
        )
      })
  })

  it('names the enumerations of instance and discriminator codes', function () {
    const enums = Object.fromEntries(
      instanceGroups.map(g => [g.id, [g.instanceEnum, g.discriminatorEnum]])
    )
    enums.should.deep.equal({
      engine: ['ENGINE_INSTANCE', undefined],
      battery: [undefined, undefined],
      charger: [undefined, undefined],
      inverter: [undefined, undefined],
      acInput: [undefined, undefined],
      tank: [undefined, 'TANK_TYPE'],
      temperature: [undefined, 'TEMPERATURE_SOURCE'],
      humidity: [undefined, 'HUMIDITY_SOURCE'],
      pressure: [undefined, 'PRESSURE_SOURCE'],
      acConnection: [undefined, undefined],
      converter: [undefined, undefined],
      dcConnection: [undefined, undefined]
    })
    instanceGroups.forEach(g => {
      g.should.have.property('instanceEnum')
      g.should.have.property('discriminatorEnum')
    })
  })

  it('instancePrefix names a PGN outside the table', function () {
    expect(() => instancePrefix({ pgn: 129025, src: 1, fields: {} })).to.throw(
      'PGN 129025 has no instance group'
    )
  })
})
