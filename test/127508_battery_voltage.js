var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));


describe('127508 battery voltage', function () {
  it('complete sentence converts', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2016-08-22T16:02:55.272Z","prio":6,"src":17,"dst":255,"pgn":127508,"description":"Battery Status","fields":{"Battery Instance":1,"Voltage":13.11,"SID":0}}'));
    tree.should.have.deep.property('electrical.batteries.1.voltage', 13.11);
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
});
