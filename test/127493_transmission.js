var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

function generatePGNs (json) {
  return [json, json.replace('Engine Instance', 'Instance')]
}

describe('127493 transmission parameters Port', function () {
  it('every field in the PGN from the NMEA2000 spec converts', function () {
    generatePGNs(
      '{    "prio": 2,    "pgn": 127493,    "dst": 255,    "src": 40, "timestamp": "2020-03-07T18:49:14.471Z",    "fields": {      "Instance": "Single Engine or Dual Engine Port",      "Transmission Gear": "Forward",      "Oil pressure": 20,      "Oil temperature": 15,      "Discrete Status 1": 34    }  }'
    ).forEach(pgn => {
      var tree = require('./testMapper').toNested(JSON.parse(pgn))

      tree.should.have.nested.property(
        'propulsion.port.transmission.oilTemperature.value',
        15
      )
      tree.should.have.nested.property(
        'propulsion.port.transmission.gear.value',
        'Forward'
      )
      tree.should.have.nested.property(
        'propulsion.port.transmission.oilPressure.value',
        20
      )
      tree.should.have.nested.property(
        'notifications.propulsion.port.transmission.checkTransmission.value.state',
        'normal'
      )
      tree.should.have.nested.property(
        'notifications.propulsion.port.transmission.overTemperature.value.state',
        'alarm'
      )
      tree.should.have.nested.property(
        'notifications.propulsion.port.transmission.lowOilPressure.value.state',
        'normal'
      )
      tree.should.have.nested.property(
        'notifications.propulsion.port.transmission.lowOilLevel.value.state',
        'normal'
      )
      tree.should.have.nested.property(
        'notifications.propulsion.port.transmission.sailDrive.value.state',
        'normal'
      )

      //temporarily until the specification is fixed
      delete tree.propulsion.port.transmission.gear
      
      tree.should.be.validSignalKVesselIgnoringIdentity
    })
  })

  it('every field in the PGN from the NMEA2000 spec converts with discrete text', function () {
    generatePGNs(
      '{    "prio": 2,    "pgn": 127493,    "dst": 255,    "src": 40, "timestamp": "2020-03-07T18:49:14.471Z",    "fields": {      "Instance": "Single Engine or Dual Engine Port",      "Transmission Gear": "Forward",      "Oil pressure": 20,      "Oil temperature": 15,      "Discrete Status 1": [ "Sail Drive" ]    }  }'
    ).forEach(pgn => {
      var tree = require('./testMapper').toNested(JSON.parse(pgn))

      tree.should.have.nested.property(
        'propulsion.port.transmission.oilTemperature.value',
        15
      )
      tree.should.have.nested.property(
        'propulsion.port.transmission.gear.value',
        'Forward'
      )
      tree.should.have.nested.property(
        'propulsion.port.transmission.oilPressure.value',
        20
      )
      tree.should.have.nested.property(
        'notifications.propulsion.port.transmission.checkTransmission.value.state',
        'normal'
      )
      tree.should.have.nested.property(
        'notifications.propulsion.port.transmission.overTemperature.value.state',
        'normal'
      )
      tree.should.have.nested.property(
        'notifications.propulsion.port.transmission.lowOilPressure.value.state',
        'normal'
      )
      tree.should.have.nested.property(
        'notifications.propulsion.port.transmission.lowOilLevel.value.state',
        'normal'
      )
      tree.should.have.nested.property(
        'notifications.propulsion.port.transmission.sailDrive.value.state',
        'alarm'
      )

      //temporarily until the specification is fixed
      delete tree.propulsion.port.transmission.gear
      
      tree.should.be.validSignalKVesselIgnoringIdentity
    })
  })
})
