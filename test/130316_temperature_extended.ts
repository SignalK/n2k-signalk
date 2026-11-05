import chai from 'chai'
chai.should()
chai.use(require('@signalk/signalk-schema').chaiModule)

const mapper = require('./testMapper')

function frame(
  instance: number | undefined,
  source: string | undefined,
  temperature: number
) {
  return {
    timestamp: '2026-10-19T12:00:00.000Z',
    prio: 6,
    src: 17,
    dst: 255,
    pgn: 130316,
    fields: { sid: 0, instance, source, temperature }
  }
}

describe('130316 temperature, extended range', function () {
  it('writes a mapped source to its path', function () {
    const n2k = frame(1, 'Exhaust Gas Temperature', 700.5)
    mapper
      .testToDelta(n2k)
      .updates[0].values.should.deep.equal([
        { path: 'propulsion.starboard.exhaustTemperature', value: 700.5 }
      ])
    mapper.toNested(n2k).should.be.validSignalKVesselIgnoringIdentity
  })

  it('writes an exhaust gas temperature under its engine, as the engine PGNs name it', function () {
    // #378: 127488 writes engine instance 0 as port and 1 as starboard
    ;[
      [0, 'propulsion.port.exhaustTemperature'],
      [1, 'propulsion.starboard.exhaustTemperature'],
      [2, 'propulsion.2.exhaustTemperature'],
      [undefined, 'propulsion.port.exhaustTemperature']
    ].forEach(([instance, path]) => {
      mapper
        .testToDelta(frame(instance as any, 'Exhaust Gas Temperature', 700))
        .updates[0].values[0].path.should.equal(path)
    })
  })

  it('replaces the spaces of an unmapped source, as 130312 does', function () {
    mapper
      .testToDelta(frame(4, 'Shaft Seal Temperature', 330.2))
      .updates[0].values.should.deep.equal([
        {
          path: 'generic.temperatures.userDefinedShaft_Seal_Temperature.4.temperature',
          value: 330.2
        }
      ])
  })

  it('writes nothing for a frame without a source', function () {
    mapper
      .testToDelta(frame(0, undefined, 300))
      .updates[0].values.should.deep.equal([])
  })

  it('writes instance 0 for a frame without an instance', function () {
    const n2k = frame(undefined, 'Inside Temperature', 295.1)
    const delta = mapper.testToDelta(n2k)
    delta.updates[0].values.should.deep.equal([
      { path: 'environment.inside.0.temperature', value: 295.1 }
    ])
    delta.updates[0].source.should.not.have.property('instance')
    mapper.toNested(n2k).should.be.validSignalKVesselIgnoringIdentity
  })
})
