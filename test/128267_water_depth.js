var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

var FromPgn = require('@canboat/canboatjs').FromPgn

describe('128267_water_depth', function () {
  it('complete positive offset sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2013-10-08-15:47:28.280Z","prio":"3","src":"1","dst":"255","pgn":"128267","description":"Water Depth","fields":{"SID":"91","Depth":8.20, "Offset":0.304}}'
      )
    )
    tree.should.have.nested.property(
      'environment.depth.belowTransducer.value',
      8.2
    )
    tree.should.have.nested.property(
      'environment.depth.surfaceToTransducer.value',
      0.304
    )
    tree.should.have.nested.property(
      'environment.depth.belowSurface.value',
      8.504
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('complete negative offset sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2013-10-08-15:47:28.280Z","prio":"3","src":"1","dst":"255","pgn":"128267","description":"Water Depth","fields":{"SID":"91","Depth":8.20, "Offset":-0.304}}'
      )
    )
    tree.should.have.nested.property(
      'environment.depth.belowTransducer.value',
      8.2
    )
    tree.should.have.nested.property(
      'environment.depth.transducerToKeel.value',
      0.304
    )
    tree.should.have.nested.property(
      'environment.depth.belowKeel.value',
      7.895999999999999
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  // An Airmar DST810 at address 35 with a keel offset of -1.000 m set in
  // CAST, recorded from a live NMEA 2000 bus.
  it('captured DST810 keel offset converts', function () {
    var n2k = new FromPgn({ useCamel: true }).parseString(
      '2026-10-13T19:52:31.815Z,3,128267,35,255,8,ff,1c,05,00,00,18,fc,0e'
    )
    var tree = require('./testMapper').n2kToNested(n2k)
    tree.should.have.nested.property(
      'environment.depth.belowTransducer.value',
      13.08
    )
    tree.should.have.nested.property(
      'environment.depth.transducerToKeel.value',
      1
    )
    tree.should.have.nested.property('environment.depth.belowKeel.value', 12.08)
    tree.should.not.have.nested.property(
      'environment.depth.surfaceToTransducer'
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
