var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('128267_water_depth', function () {
  it('complete positive offset sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2013-10-08-15:47:28.280Z","prio":"3","src":"1","dst":"255","pgn":"128267","description":"Water Depth","fields":{"SID":"91","Depth":"8.20", "Offset":0.304}}'
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
        '{"timestamp":"2013-10-08-15:47:28.280Z","prio":"3","src":"1","dst":"255","pgn":"128267","description":"Water Depth","fields":{"SID":"91","Depth":"8.20", "Offset":-0.304}}'
      )
    )
    tree.should.have.nested.property(
      'environment.depth.belowTransducer.value',
      8.2
    )
    tree.should.have.nested.property(
      'environment.depth.transducerToKeel.value',
      -0.304
    )
    tree.should.have.nested.property(
      'environment.depth.belowKeel.value',
      7.895999999999999
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
