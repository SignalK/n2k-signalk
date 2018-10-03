var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

function generatePGNs(json) {
  return [json, json.replace('Engine Instance', 'Instance').replace('Engine Speed', 'Speed')]
}

describe('127488 engine speed Port', function () {
  it('complete engine speed sentence converts', function () {
    generatePGNs('{"timestamp":"2015-01-15-16:16:56.749Z","prio":"2","src":"17","dst":"255","pgn":"127488","description":"Engine Parameters, Rapid Update","fields":{"Engine Instance":"Single Engine or Dual Engine Port","Engine Speed":"3190"}}')
      .forEach(pgn => {
        var tree = require('./testMapper').toNested(
          JSON.parse(pgn)
        )
        tree.should.have.nested.property('propulsion.port.revolutions')
        tree.should.have.nested.property(
          'propulsion.port.revolutions.value',
          53.166666666666664
        )
        tree.should.be.validSignalKVesselIgnoringIdentity
      })
  })
})

describe('127488 engine speed Starboard', function () {
  it('complete engine speed sentence converts', function () {
    generatePGNs('{"timestamp":"2015-01-15-16:16:56.749Z","prio":"2","src":"17","dst":"255","pgn":"127488","description":"Engine Parameters, Rapid Update","fields":{"Engine Instance":"Dual Engine Starboard","Engine Speed":"3190"}}')
      .forEach(pgn => {
        var tree = require('./testMapper').toNested(
          JSON.parse(pgn)
        )
        tree.should.have.nested.property('propulsion.starboard.revolutions')
        tree.should.have.nested.property(
          'propulsion.starboard.revolutions.value',
          53.166666666666664
        )
        tree.should.be.validSignalKVesselIgnoringIdentity
      })
  })
})
