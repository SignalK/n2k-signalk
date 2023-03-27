var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('127489 engine parameters Port', function () {
  it('every field in the PGN from the NMEA2000 spec converts', function () {
    var tree = require('./testMapper').toNested(JSON.parse(
      '{"timestamp":"2015-01-15-16:25:14.952Z","prio":"2","src":"17","dst":"255","pgn":"127489", "description":"Engine Parameters, Dynamic","fields":{"Instance":"Single Engine or Dual Engine Port","Temperature":29.85,"Alternator Potential":12.60,"Fuel Rate":0.4,"Total Engine hours":309960,"Discrete Status 1":["Low Oil Pressure","Low Coolant Level"],"Discrete Status 2":[ "Warning Level 1","Maintenance Needed"],"Percent Engine Load": 20,"Percent Engine Torque":57,"Oil pressure":80000,"Fuel Pressure":504,"Oil temperature":36,"Coolant Pressure":38900}}'
    ))
    
    tree.should.have.nested.property('propulsion.port.oilTemperature')
    tree.should.have.nested.property(
        'propulsion.port.oilTemperature.value',
      36
    )
    tree.should.have.nested.property('propulsion.port.coolantPressure')
    tree.should.have.nested.property(
      'propulsion.port.coolantPressure.value',
      38900000
    )
    tree.should.have.nested.property('propulsion.port.fuel.pressure')
    tree.should.have.nested.property(
      'propulsion.port.fuel.pressure.value',
      504000
    )
    
    tree.should.have.nested.property('propulsion.port.temperature')
    tree.should.have.nested.property(
      'propulsion.port.temperature.value',
      29.85
    )
    tree.should.have.nested.property('propulsion.port.alternatorVoltage')
    tree.should.have.nested.property(
      'propulsion.port.alternatorVoltage.value',
      12.6
    )
    tree.should.have.nested.property('propulsion.port.fuel.rate')
    tree.should.have.nested.property(
      'propulsion.port.fuel.rate.value',
      1.1111111111111112e-7
    )
    tree.should.have.nested.property('propulsion.port.runTime')
    tree.should.have.nested.property('propulsion.port.runTime.value', 309960)
    tree.should.have.nested.property('propulsion.port.oilPressure')
    tree.should.have.nested.property('propulsion.port.oilPressure.value', 80000)
    tree.should.have.nested.property('propulsion.port.engineLoad.value', 0.2)
    tree.should.have.nested.property(
      'propulsion.port.engineTorque.value',
      0.57
    )
    tree.should.have.nested.property(
      'notifications.propulsion.port.lowOilPressure.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.port.lowCoolantLevel.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.port.warningLevel1.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.port.maintenanceNeeded.value.state',
      'alarm'
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('complete engine params sentence converts', function () {
    var tree = require('./testMapper').toNested(JSON.parse(
      '{"timestamp":"2015-01-15-16:25:14.952Z","prio":"2","src":"17","dst":"255","pgn":"127489",	"description":"Engine Parameters, Dynamic","fields":{"Instance":"Single Engine or Dual Engine Port","Temperature":29.85,"Alternator Potential":12.60,"Fuel Rate":0.4,"Total Engine hours":309960,"Discrete Status 1":["Low Oil Pressure","Low Coolant Level"],"Discrete Status 2":[ "Warning Level 1","Maintenance Needed"],"Percent Engine Load": 20,"Percent Engine Torque":57,"Oil pressure":80000}}'
    ))
    tree.should.have.nested.property('propulsion.port.temperature')
    tree.should.have.nested.property(
      'propulsion.port.temperature.value',
      29.85
    )
    tree.should.have.nested.property('propulsion.port.alternatorVoltage')
    tree.should.have.nested.property(
      'propulsion.port.alternatorVoltage.value',
      12.6
    )
    tree.should.have.nested.property('propulsion.port.fuel.rate')
    tree.should.have.nested.property(
      'propulsion.port.fuel.rate.value',
      1.1111111111111112e-7
    )
    tree.should.have.nested.property('propulsion.port.runTime')
    tree.should.have.nested.property('propulsion.port.runTime.value', 309960)
    tree.should.have.nested.property('propulsion.port.oilPressure')
    tree.should.have.nested.property('propulsion.port.oilPressure.value', 80000)
    tree.should.have.nested.property('propulsion.port.engineLoad.value', 0.2)
    tree.should.have.nested.property(
      'propulsion.port.engineTorque.value',
      0.57
    )
    tree.should.have.nested.property(
      'notifications.propulsion.port.lowOilPressure.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.port.lowCoolantLevel.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.port.warningLevel1.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.port.maintenanceNeeded.value.state',
      'alarm'
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})

describe('127489 engine parameters Starboard', function () {
  it('every field in the PGN from the NMEA2000 spec converts', function () {
    var tree = require('./testMapper').toNested(JSON.parse(
      '{"timestamp":"2015-01-15-16:25:14.952Z","prio":"2","src":"17","dst":"255","pgn":"127489", "description":"Engine Parameters, Dynamic","fields":{"Instance":"Dual Engine Starboard","Temperature":29.85,"Alternator Potential":12.60,"Fuel Rate":0.4,"Total Engine hours":309960,"Discrete Status 1":["Low Oil Pressure","Low Coolant Level"],"Discrete Status 2":[ "Warning Level 1","Maintenance Needed"],"Percent Engine Load": 20,"Percent Engine Torque":57,"Oil pressure":80000,"Fuel Pressure":504,"Oil temperature":36,"Coolant Pressure":38900}}'
    ))

    tree.should.have.nested.property('propulsion.starboard.oilTemperature')
    tree.should.have.nested.property(
      'propulsion.starboard.oilTemperature.value',
      36
    )
    tree.should.have.nested.property('propulsion.starboard.coolantPressure')
    tree.should.have.nested.property(
      'propulsion.starboard.coolantPressure.value',
      38900000
    )
    tree.should.have.nested.property('propulsion.starboard.fuel.pressure')
    tree.should.have.nested.property(
      'propulsion.starboard.fuel.pressure.value',
      504000
    )

    tree.should.have.nested.property('propulsion.starboard.temperature')
    tree.should.have.nested.property(
      'propulsion.starboard.temperature.value',
      29.85
    )
    tree.should.have.nested.property('propulsion.starboard.alternatorVoltage')
    tree.should.have.nested.property(
      'propulsion.starboard.alternatorVoltage.value',
      12.6
    )
    tree.should.have.nested.property('propulsion.starboard.fuel.rate')
    tree.should.have.nested.property(
      'propulsion.starboard.fuel.rate.value',
      1.1111111111111112e-7
    )
    tree.should.have.nested.property('propulsion.starboard.runTime')
    tree.should.have.nested.property(
      'propulsion.starboard.runTime.value',
      309960
    )
    tree.should.have.nested.property('propulsion.starboard.oilPressure')
    tree.should.have.nested.property(
      'propulsion.starboard.oilPressure.value',
      80000
    )
    tree.should.have.nested.property(
      'propulsion.starboard.engineLoad.value',
      0.2
    )
    tree.should.have.nested.property(
      'propulsion.starboard.engineTorque.value',
      0.57
    )
    tree.should.have.nested.property(
      'notifications.propulsion.starboard.lowOilPressure.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.starboard.lowCoolantLevel.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.starboard.warningLevel1.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.starboard.maintenanceNeeded.value.state',
      'alarm'
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('complete engine params sentence converts', function () {
    var tree = require('./testMapper').toNested(JSON.parse(
      '{"timestamp":"2015-01-15-16:25:14.952Z","prio":"2","src":"17","dst":"255","pgn":"127489","description":"Engine Parameters, Dynamic","fields":{"Instance":"Dual Engine Starboard","Temperature":29.85,"Alternator Potential":12.60,"Fuel Rate":0.1,"Total Engine hours":309960,"Discrete Status 1":["Low Oil Pressure","Low Coolant Level"],"Discrete Status 2":["Warning Level 1","Maintenance Needed"],"Percent Engine Load": 20,"Percent Engine Torque": 57,"Oil pressure":80000}}'
    ))
    tree.should.have.nested.property('propulsion.starboard.temperature')
    tree.should.have.nested.property(
      'propulsion.starboard.temperature.value',
      29.85
    )
    tree.should.have.nested.property('propulsion.starboard.alternatorVoltage')
    tree.should.have.nested.property(
      'propulsion.starboard.alternatorVoltage.value',
      12.6
    )
    tree.should.have.nested.property('propulsion.starboard.fuel.rate')
    tree.should.have.nested.property(
      'propulsion.starboard.fuel.rate.value',
      2.777777777777778e-8
    )
    tree.should.have.nested.property('propulsion.starboard.runTime')
    tree.should.have.nested.property(
      'propulsion.starboard.runTime.value',
      309960
    )
    tree.should.have.nested.property('propulsion.starboard.oilPressure')
    tree.should.have.nested.property(
      'propulsion.starboard.oilPressure.value',
      80000
    )
    tree.should.have.nested.property(
      'propulsion.starboard.engineLoad.value',
      0.2
    )
    tree.should.have.nested.property(
      'propulsion.starboard.engineTorque.value',
      0.57
    )
    tree.should.have.nested.property(
      'notifications.propulsion.starboard.lowOilPressure.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.starboard.lowCoolantLevel.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.starboard.warningLevel1.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.starboard.maintenanceNeeded.value.state',
      'alarm'
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('engine notifications work', function () {
    var tree = require('./testMapper').toNested(JSON.parse(
      '{"timestamp":"2015-01-15-16:25:14.952Z","prio":"2","src":"17","dst":"255","pgn":"127489","description":"Engine Parameters, Dynamic","fields":{"Instance":"Dual Engine Starboard","Temperature":29.85,"Alternator Potential":12.60,"Fuel Rate":0.1,"Total Engine hours":309960,"Discrete Status 1":["Low Oil Pressure"],"Discrete Status 2": [],"Percent Engine Load": 20,"Percent Engine Torque": 57,"Oil pressure":80000}}'
    ))
    tree.should.have.nested.property(
      'notifications.propulsion.starboard.lowOilPressure.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.starboard.lowCoolantLevel.value.state',
      'normal'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.starboard.warningLevel1.value.state',
      'normal'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.starboard.maintenanceNeeded.value.state',
      'normal'
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})

describe('127489 engine parameters 2', function () {
  it('every field in the PGN from the NMEA2000 spec converts', function () {
    var tree = require('./testMapper').toNested(JSON.parse(
      '{"timestamp":"2015-01-15-16:25:14.952Z","prio":"2","src":"17","dst":"255","pgn":"127489", "description":"Engine Parameters, Dynamic","fields":{"Instance":2,"Temperature":29.85,"Alternator Potential":12.60,"Fuel Rate":0.4,"Total Engine hours":309960,"Discrete Status 1":["Low Oil Pressure","Low Coolant Level"],"Discrete Status 2":[ "Warning Level 1","Maintenance Needed"],"Percent Engine Load": 20,"Percent Engine Torque":57,"Oil pressure":80000,"Fuel Pressure":504,"Oil temperature":36,"Coolant Pressure":38900}}'
    ))

    tree.should.have.nested.property('propulsion.2.oilTemperature')
    tree.should.have.nested.property('propulsion.2.oilTemperature.value', 36)
    tree.should.have.nested.property('propulsion.2.coolantPressure')
    tree.should.have.nested.property(
      'propulsion.2.coolantPressure.value',
      38900000
    )
    tree.should.have.nested.property('propulsion.2.fuel.pressure')
    tree.should.have.nested.property(
      'propulsion.2.fuel.pressure.value',
      504000
    )

    tree.should.have.nested.property('propulsion.2.temperature')
    tree.should.have.nested.property('propulsion.2.temperature.value', 29.85)
    tree.should.have.nested.property('propulsion.2.alternatorVoltage')
    tree.should.have.nested.property(
      'propulsion.2.alternatorVoltage.value',
      12.6
    )
    tree.should.have.nested.property('propulsion.2.fuel.rate')
    tree.should.have.nested.property(
      'propulsion.2.fuel.rate.value',
      1.1111111111111112e-7
    )
    tree.should.have.nested.property('propulsion.2.runTime')
    tree.should.have.nested.property('propulsion.2.runTime.value', 309960)
    tree.should.have.nested.property('propulsion.2.oilPressure')
    tree.should.have.nested.property('propulsion.2.oilPressure.value', 80000)
    tree.should.have.nested.property('propulsion.2.engineLoad.value', 0.2)
    tree.should.have.nested.property('propulsion.2.engineTorque.value', 0.57)
    tree.should.have.nested.property(
      'notifications.propulsion.2.lowOilPressure.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.2.lowCoolantLevel.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.2.warningLevel1.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.2.maintenanceNeeded.value.state',
      'alarm'
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('complete engine params sentence converts', function () {
    var tree = require('./testMapper').toNested(JSON.parse(
      '{"timestamp":"2015-01-15-16:25:14.952Z","prio":"2","src":"17","dst":"255","pgn":"127489",	"description":"Engine Parameters, Dynamic","fields":{"Instance":2,"Temperature":29.85,"Alternator Potential":12.60,"Fuel Rate":0.4,"Total Engine hours":309960,"Discrete Status 1":["Low Oil Pressure","Low Coolant Level"],"Discrete Status 2":[ "Warning Level 1","Maintenance Needed"],"Percent Engine Load": 20,"Percent Engine Torque":57,"Oil pressure":80000}}'
    ))
    tree.should.have.nested.property('propulsion.2.temperature')
    tree.should.have.nested.property('propulsion.2.temperature.value', 29.85)
    tree.should.have.nested.property('propulsion.2.alternatorVoltage')
    tree.should.have.nested.property(
      'propulsion.2.alternatorVoltage.value',
      12.6
    )
    tree.should.have.nested.property('propulsion.2.fuel.rate')
    tree.should.have.nested.property(
      'propulsion.2.fuel.rate.value',
      1.1111111111111112e-7
    )
    tree.should.have.nested.property('propulsion.2.runTime')
    tree.should.have.nested.property('propulsion.2.runTime.value', 309960)
    tree.should.have.nested.property('propulsion.2.oilPressure')
    tree.should.have.nested.property('propulsion.2.oilPressure.value', 80000)
    tree.should.have.nested.property('propulsion.2.engineLoad.value', 0.2)
    tree.should.have.nested.property('propulsion.2.engineTorque.value', 0.57)
    tree.should.have.nested.property(
      'notifications.propulsion.2.lowOilPressure.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.2.lowCoolantLevel.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.2.warningLevel1.value.state',
      'alarm'
    )
    tree.should.have.nested.property(
      'notifications.propulsion.2.maintenanceNeeded.value.state',
      'alarm'
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
