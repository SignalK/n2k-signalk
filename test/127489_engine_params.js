var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);



describe('127489 engine parameters Port', function () {
  it('complete engine params sentence converts', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2015-01-15-16:25:14.952","prio":"2","src":"17","dst":"255","pgn":"127489",	"description":"Engine Parameters, Dynamic","fields":{"Engine Instance":"Single Engine or Dual Engine Port","Temperature":"29.85","Alternator Potential":"12.60","Fuel Rate":"-0.1","Total Engine hours":"309960","Discrete Status 1":"0","Discrete Status 2":"0","Percent Engine Load":"-1","Percent Engine Torque":"-1"}}'));
    tree.should.have.deep.property('propulsion.port.temperature');
    tree.should.have.deep.property('propulsion.port.temperature.value', 29.85);
    tree.should.have.deep.property('propulsion.port.alternatorVoltage');
    tree.should.have.deep.property('propulsion.port.alternatorVoltage.value', 12.60);
    tree.should.have.deep.property('propulsion.port.fuelRate');
    tree.should.have.deep.property('propulsion.port.fuelRate.value', -0.1); 
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
});

describe('127489 engine parameters Starboard', function () {
  it('complete engine params sentence converts', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2015-01-15-16:25:14.952","prio":"2","src":"17","dst":"255","pgn":"127489","description":"Engine Parameters, Dynamic","fields":{"Engine Instance":"Dual Engine Starboard","Temperature":"29.85","Alternator Potential":"12.60","Fuel Rate":"-0.1","Total Engine hours":"309960","Discrete Status 1":"0","Discrete Status 2":"0","Percent Engine Load":"-1","Percent Engine Torque":"-1"}}'));
    tree.should.have.deep.property('propulsion.starboard.temperature');
    tree.should.have.deep.property('propulsion.starboard.temperature.value', 29.85);
    tree.should.have.deep.property('propulsion.starboard.alternatorVoltage');
    tree.should.have.deep.property('propulsion.starboard.alternatorVoltage.value', 12.60);
    tree.should.have.deep.property('propulsion.starboard.fuelRate');
    tree.should.have.deep.property('propulsion.starboard.fuelRate.value', -0.1); 
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
});