var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('128259 speed', function () {
  it('complete sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2014-08-15-18:00:30.175Z","prio":"2","src":"115","dst":"255","pgn":"128259","description":"Speed","fields":{"SID":"0","Speed Water Referenced":"3.47"}}'
      )
    )
    tree.should.have.nested.property('navigation.speedThroughWater')
    tree.should.have.nested.property('navigation.speedThroughWater.value', 3.47)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('speed water reference type converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2014-08-15-18:00:30.175Z","prio":"2","src":"115","dst":"255","pgn":"128259","description":"Speed","fields":{"SID":"0","Speed Water Referenced":"3.47", "Speed Water Referenced Type":"Paddle wheel"}}'
      )
    )
    tree.should.have.nested.property('navigation.speedThroughWater')
    tree.should.have.nested.property('navigation.speedThroughWater.value', 3.47)
    tree.should.have.nested.property('navigation.speedThroughWaterReferenceType.value', 'Paddle wheel')
  })  
})
