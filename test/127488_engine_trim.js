var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

function generatePGNs (json) {
  return [
    json,
    json.replace('Engine Instance', 'Instance')
  ]
}

describe('127488 engine trim Port', function () {
  it('complete engine trim sentence converts', function () {
    generatePGNs(
      '{"timestamp":"2019-01-09T00:11:11.654Z","prio":2,"pgn":127488,"src":8,"dst":255,"fields":{"Instance":"Single Engine or Dual Engine Port","Speed":0,"Tilt/Trim":31},"description":"Engine Parameters, Rapid Update"}'
    ).forEach(pgn => {
      var tree = require('./testMapper').toNested(JSON.parse(pgn))
      tree.should.have.nested.property('propulsion.port.drive.trimState')
      tree.should.have.nested.property(
        'propulsion.port.drive.trimState.value',
        0.31
      )
      tree.should.be.validSignalKVesselIgnoringIdentity
    })
  })
})

describe('127488 engine trim Starboard', function () {
  it('complete engine trim sentence converts', function () {
    generatePGNs(
        '{"timestamp":"2019-01-09T00:11:11.654Z","prio":2,"pgn":127488,"src":8,"dst":255,"fields":{"Instance":"Dual Engine Starboard","Speed":0,"Tilt/Trim":31},"description":"Engine Parameters, Rapid Update"}'
    ).forEach(pgn => {
      var tree = require('./testMapper').toNested(JSON.parse(pgn))
      tree.should.have.nested.property('propulsion.starboard.drive.trimState')
      tree.should.have.nested.property(
        'propulsion.starboard.drive.trimState.value',
        0.31
      )
      tree.should.be.validSignalKVesselIgnoringIdentity
    })
  })
})

describe('127488 engine trim 2', function () {
  it('complete engine trim sentence converts', function () {
    generatePGNs(
        '{"timestamp":"2019-01-09T00:11:11.654Z","prio":2,"pgn":127488,"src":8,"dst":255,"fields":{"Instance":2,"Speed":0,"Tilt/Trim":31},"description":"Engine Parameters, Rapid Update"}'
    ).forEach(pgn => {
      var tree = require('./testMapper').toNested(JSON.parse(pgn))
      tree.should.have.nested.property('propulsion.2.drive.trimState')
      tree.should.have.nested.property(
        'propulsion.2.drive.trimState.value',
        0.31
      )
      tree.should.be.validSignalKVesselIgnoringIdentity
    })
  })
})
