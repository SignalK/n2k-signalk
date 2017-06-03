var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);



describe('127489 engine parameters Port', function () {
  it('complete engine params sentence converts', function () {
    var tree = require("../n2kMapper.js").toNested(
    JSON.parse('{"timestamp":"2015-01-15-16:25:14.952Z","prio":"2","src":"17","dst":"255","pgn":"127489",	"description":"Engine Parameters, Dynamic","fields":{"Engine Instance":"Single Engine or Dual Engine Port","Temperature":"29.85","Alternator Potential":"12.60","Fuel Rate":"0.4","Total Engine hours":"309960","Discrete Status 1":"0","Discrete Status 2":"0","Percent Engine Load": 20,"Percent Engine Torque":57,"Oil pressure":80}}'));
    tree.should.have.deep.property('propulsion.port.temperature');
    tree.should.have.deep.property('propulsion.port.temperature.value', 29.85);
    tree.should.have.deep.property('propulsion.port.alternatorVoltage');
    tree.should.have.deep.property('propulsion.port.alternatorVoltage.value', 12.60);
    tree.should.have.deep.property('propulsion.port.fuel.rate');
    tree.should.have.deep.property('propulsion.port.fuel.rate.value', 1.1111111111111112e-7);
    tree.should.have.deep.property('propulsion.port.runTime');
    tree.should.have.deep.property('propulsion.port.runTime.value', 309960);
    tree.should.have.deep.property('propulsion.port.oilPressure');
    tree.should.have.deep.property('propulsion.port.oilPressure.value', 80000);
    tree.should.have.deep.property('propulsion.port.engineLoad.value', 0.2);
    tree.should.have.deep.property('propulsion.port.engineTorque.value', 0.57);    
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
});

describe('127489 engine parameters Starboard', function () {
  it('complete engine params sentence converts', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2015-01-15-16:25:14.952Z","prio":"2","src":"17","dst":"255","pgn":"127489","description":"Engine Parameters, Dynamic","fields":{"Engine Instance":"Dual Engine Starboard","Temperature":"29.85","Alternator Potential":"12.60","Fuel Rate":"0.1","Total Engine hours":"309960","Discrete Status 1":"0","Discrete Status 2":"0","Percent Engine Load": 20,"Percent Engine Torque": 57,"Oil pressure":80}}'));
    tree.should.have.deep.property('propulsion.starboard.temperature');
    tree.should.have.deep.property('propulsion.starboard.temperature.value', 29.85);
    tree.should.have.deep.property('propulsion.starboard.alternatorVoltage');
    tree.should.have.deep.property('propulsion.starboard.alternatorVoltage.value', 12.60);
    tree.should.have.deep.property('propulsion.starboard.fuel.rate');
    tree.should.have.deep.property('propulsion.starboard.fuel.rate.value', 2.777777777777778e-8);
    tree.should.have.deep.property('propulsion.starboard.runTime');
    tree.should.have.deep.property('propulsion.starboard.runTime.value', 309960);
    tree.should.have.deep.property('propulsion.starboard.oilPressure');
    tree.should.have.deep.property('propulsion.starboard.oilPressure.value', 80000);
    tree.should.have.deep.property('propulsion.starboard.engineLoad.value', 0.2);
    tree.should.have.deep.property('propulsion.starboard.engineTorque.value', 0.57);    
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
});
