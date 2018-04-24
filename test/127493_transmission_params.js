var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('127489 engine parameters Port', function () {
  it('every field in the PGN from the NMEA2000 spec converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2015-01-15-16:25:14.952Z","prio":"2","src":"17","dst":"255","pgn":"127493", "description":"Transmission Parameters, Dynamic","fields":{"Engine Instance":"Single Engine or Dual Engine Port","Transmission Gear":"Forward","Oil pressure":489,"Oil temperature":443}}'
      )
    )

    tree.should.have.nested.property('propulsion.port.transmission.oilPressure.value', 48900)
    tree.should.have.nested.property('propulsion.port.transmission.oilTemperature.value', 443)
    tree.should.have.nested.property('propulsion.port.transmission.gear.value', 'Forward')
  })

})
