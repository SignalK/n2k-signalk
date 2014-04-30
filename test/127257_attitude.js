var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));


describe('127257_attitude', function () {
  it('complete sentence converts', function () {
    var msgs = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2013-10-08-15:47:28.263","prio":"2","src":"204","dst":"255","pgn":"127257","description":"Attitude","fields":{"Yaw":"37.190","Pitch":"0.464","Roll":"-2.496"}}'));
    msgs.length.should.equal(3);
    msgs.should.contain.an.item.with.deep.property('navigation.yaw');
    msgs.should.contain.an.item.with.deep.property('navigation.yaw.value', 37.190);
    msgs.should.contain.an.item.with.deep.property('navigation.pitch');
    msgs.should.contain.an.item.with.deep.property('navigation.pitch.value', 0.464);
    msgs.should.contain.an.item.with.deep.property('navigation.roll');
    msgs.should.contain.an.item.with.deep.property('navigation.roll.value', -2.496);
  });
});



