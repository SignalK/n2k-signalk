var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));


describe('127506 dc detailed status', function () {
  it('complete sentence converts', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2016-08-22T16:02:55.272Z","prio":6,"src":17,"dst":255,"pgn":127506,"description":"DC Detailed Status","fields":{"DC Instance":1,"State of Charge":60,"State of Health":99,"Time Remaining": 600, "Ripple Voltage": 10.9, "SID":0}}'));
    tree.should.have.deep.property('electrical.batteries.1.capacity.stateOfCharge.value', 60);
    tree.should.have.deep.property('electrical.batteries.1.capacity.stateOfHealth.value', 99);
    tree.should.have.deep.property('electrical.batteries.1.capacity.timeRemaining.value', 600);
    //tree.should.have.deep.property('electrical.batteries.1.voltage.ripple.value', 10.9);
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
});
