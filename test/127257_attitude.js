var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);


describe('127257_attitude', function () {
  it('complete sentence converts', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2013-10-08-15:47:28.263","prio":"2","src":"204","dst":"255","pgn":"127257","description":"Attitude","fields":{"Yaw":"37.190","Pitch":"0.464","Roll":"-2.496"}}'));
    tree.should.have.deep.property('navigation.yaw');
    tree.should.have.deep.property('navigation.yaw.value', 37.190);
    tree.should.have.deep.property('navigation.pitch');
    tree.should.have.deep.property('navigation.pitch.value', 0.464);
    tree.should.have.deep.property('navigation.roll');
    tree.should.have.deep.property('navigation.roll.value', -2.496);
    tree.should.be.validSignalK;
  });
});



