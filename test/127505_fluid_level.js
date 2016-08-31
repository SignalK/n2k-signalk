var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);

/*
{"timestamp":"2015-01-15-16:15:30.984","prio":"6","src":"17","dst":"255","pgn":"127505","description":"Fluid Level","fields":{"Instance":"0","Type":"Fuel","Level":"131.068"}}
{"timestamp":"2015-01-15-16:15:33.341","prio":"6","src":"112","dst":"255","pgn":"127505","description":"Fluid Level","fields":{"Instance":"0","Type":"Fuel","Level":"64.284","Capacity":"41.6"}}
{"timestamp":"2015-01-15-16:15:33.366","prio":"6","src":"114","dst":"255","pgn":"127505","description":"Fluid Level","fields":{"Instance":"0","Type":"Water","Level":"88.596","Capacity":"71.9"}}
{"timestamp":"2015-01-15-16:15:33.369","prio":"6","src":"113","dst":"255","pgn":"127505","description":"Fluid Level","fields":{"Instance":"0","Type":"Gray water","Level":"90.240","Capacity":"37.9"}}
*/


describe('127505 fuel', function() {
  it('just level, no capacity', function() {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2015-01-15-16:15:30.984","prio":"6","src":"17","dst":"255","pgn":"127505","description":"Fluid Level","fields":{"Instance":"0","Type":"Fuel","Level":"131.068"}}'));
    tree.should.have.deep.property('tanks.fuel.0.currentLevel.value', 131.068);
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
  it('level and capacity', function() {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2015-01-15-16:15:33.341","prio":"6","src":"112","dst":"255","pgn":"127505","description":"Fluid Level","fields":{"Instance":"1","Type":"Fuel","Level":"64.284","Capacity":"41.6"}}'));
    tree.should.have.deep.property('tanks.fuel.1.currentLevel.value', 64.284);
    tree.should.have.deep.property('tanks.fuel.1.capacity.value', 41.6);
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
});

describe('127505 water', function() {
  it('level and capacity', function() {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2015-01-15-16:15:33.366","prio":"6","src":"114","dst":"255","pgn":"127505","description":"Fluid Level","fields":{"Instance":"0","Type":"Water","Level":"88.596","Capacity":"71.9"}}'));
    tree.should.have.deep.property('tanks.water.0.currentLevel.value', 88.596);
    tree.should.have.deep.property('tanks.water.0.capacity.value', 71.9);
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
});

describe('127505 water', function() {
  it('level and capacity', function() {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2015-01-15-16:15:33.369","prio":"6","src":"113","dst":"255","pgn":"127505","description":"Fluid Level","fields":{"Instance":"0","Type":"Gray water","Level":"90.240","Capacity":"37.9"}}'));
    tree.should.have.deep.property('tanks.grayWater.0.currentLevel.value', 90.240);
    tree.should.have.deep.property('tanks.grayWater.0.capacity.value', 37.9);
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
});
