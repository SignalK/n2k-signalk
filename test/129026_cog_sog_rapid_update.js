var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('129026 COG & SOG, Rapid Update', function () {
  it('complete sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2014-08-15-18:00:10.005Z","prio":"2","src":"160","dst":"255","pgn":"129026","description":"COG & SOG, Rapid Update","fields":{"COG Reference":"True","COG":2.9384,"SOG":3.65}}'
      )
    )
    tree.should.have.nested.property('navigation.courseOverGroundTrue')
    tree.should.have.nested.property(
      'navigation.courseOverGroundTrue.value',
      2.9384
    )
    tree.should.have.nested.property('navigation.speedOverGround')
    tree.should.have.nested.property('navigation.speedOverGround.value', 3.65)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('just COG converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2015-01-15-16:25:12.021Z","prio":2,"src":245,"dst":255,"pgn":129026,"description":"COG & SOG, Rapid Update","fields":{"SID":138,"COG Reference":"True","SOG":0.00}}'
      )
    )
    tree.should.not.have.nested.property('navigation.courseOverGroundTrue')
    tree.should.have.nested.property('navigation.speedOverGround')
    tree.should.have.nested.property('navigation.speedOverGround.value', 0.0)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
