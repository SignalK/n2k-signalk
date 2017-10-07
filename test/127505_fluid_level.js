var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('127505 fuel', function () {
  it('just level, no capacity', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2015-01-15-16:15:30.984Z","prio":"6","src":"17","dst":"255","pgn":"127505","description":"Fluid Level","fields":{"Instance":"0","Type":"Fuel","Level":"131.068"}}'
      )
    )
    tree.should.have.nested.property('tanks.fuel.0.currentLevel.value', 1.31068)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
  it('level and capacity', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2015-01-15-16:15:33.341Z","prio":"6","src":"112","dst":"255","pgn":"127505","description":"Fluid Level","fields":{"Instance":"1","Type":"Fuel","Level":"64.284","Capacity":"41.6"}}'
      )
    )
    tree.tanks.fuel['1'].currentLevel.value.should.be.closeTo(0.64284, 0.000005)
    tree.should.have.nested.property('tanks.fuel.1.capacity.value', 41.6)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})

describe('127505 water', function () {
  it('level and capacity', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2015-01-15-16:15:33.366Z","prio":"6","src":"114","dst":"255","pgn":"127505","description":"Fluid Level","fields":{"Instance":"0","Type":"Water","Level":"88.596","Capacity":"71.9"}}'
      )
    )
    tree.tanks.freshWater['0'].currentLevel.value.should.be.closeTo(
      0.88596,
      0.000005
    )
    tree.should.have.nested.property('tanks.freshWater.0.capacity.value', 71.9)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})

describe('127505 grayWater', function () {
  it('level and capacity', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2015-01-15-16:15:33.369Z","prio":"6","src":"113","dst":"255","pgn":"127505","description":"Fluid Level","fields":{"Instance":"0","Type":"Gray water","Level":"90.240","Capacity":"37.9"}}'
      )
    )
    tree.should.have.nested.property(
      'tanks.wasteWater.0.currentLevel.value',
      0.9024
    )
    tree.should.have.nested.property('tanks.wasteWater.0.capacity.value', 37.9)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
