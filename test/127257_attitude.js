var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);


describe('127257_attitude', function () {
  it('complete sentence converts', function () {
    var tree = require("../n2kMapper.js").toFullVessel(
      JSON.parse('{"timestamp":"2013-10-08-15:47:28.263","prio":"2","src":"204","dst":"255","pgn":"127257","description":"Attitude","fields":{"Yaw":"37.190","Pitch":"0.464","Roll":"-2.496"}}'));
    tree.should.have.deep.property('navigation.attitude.yaw', 37.190);
    tree.should.have.deep.property('navigation.attitude.pitch', 0.464);
    tree.should.have.deep.property('navigation.attitude.roll', -2.496);
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
});



