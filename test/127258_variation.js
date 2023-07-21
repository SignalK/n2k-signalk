var chai = require('chai')
chai.Should()
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('127258_variation ', function () {
  it('complete sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2015-01-15-16:25:11.333Z","prio":7,"src":4,"dst":255,"pgn":127258,"description":"Magnetic Variation","fields":{"SID":247,"Variation":1.1}}'
      )
    )
    tree.navigation.magneticVariation.should.have.property('value', 1.1)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
