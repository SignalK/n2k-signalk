var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('127488 engine boost Port', function () {
  it('complete engine boost sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2015-01-15-16:16:56.749Z","prio":"2","src":"17","dst":"255","pgn":"127488","description":"Engine Parameters, Rapid Update","fields":{"Instance":"Single Engine or Dual Engine Port","Speed":3190, "Boost Pressure": 393000}}'
      )
    )
    console.log(tree)
    tree.should.have.nested.property('propulsion.port.boostPressure')
    tree.should.have.nested.property(
      'propulsion.port.boostPressure.value',
      393000
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})

describe('127488 engine boost Starboard', function () {
  it('complete engine speed sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2015-01-15-16:16:56.749Z","prio":"2","src":"17","dst":"255","pgn":"127488","description":"Engine Parameters, Rapid Update","fields":{"Instance":"Dual Engine Starboard","Speed":"3190","Boost Pressure": 393000}}'
      )
    )
    tree.should.have.nested.property('propulsion.starboard.boostPressure')
    tree.should.have.nested.property(
      'propulsion.starboard.boostPressure.value',
      393000
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})

describe('127488 engine boost 2', function () {
  it('complete engine speed sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2015-01-15-16:16:56.749Z","prio":"2","src":"17","dst":"255","pgn":"127488","description":"Engine Parameters, Rapid Update","fields":{"Instance":2,"Speed":3190, "Boost Pressure": 393000}}'
      )
    )

    tree.should.have.nested.property('propulsion.2.boostPressure')
    tree.should.have.nested.property('propulsion.2.boostPressure.value', 393000)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
