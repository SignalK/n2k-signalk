var chai = require("chai");
chai.Should();

describe('127245_rudder ', function () {
  it('complete sentence converts', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2013-10-08-15:47:28.263","prio":"2","src":"204","dst":"255","pgn":"127245","description":"Rudder","fields":{"Instance":"0","Position":"-0.7"}}'));
    tree.vessel.rudder.should.have.property('value', -0.7);
  });

  it('direction order is not handled', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2013-10-08-15:47:28.263","prio":"2","src":"204","dst":"255","pgn":"127245","description":"Rudder","fields":{"Instance":"252","Direction Order":"0"}}'));
    Object.getOwnPropertyNames(tree).length.should.equal(0);
  });
});