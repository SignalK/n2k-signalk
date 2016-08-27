var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);


describe('127505 tanks', function () {
  it('complete sentence converts', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2016-08-22T16:02:55.773Z","prio":6,"src":17,"dst":255,"pgn":127505,"description":"Fluid Level","fields":{"Instance":0,"Type":"Fuel","Level":30.280,"Capacity":49.0}}'));
    tree.should.have.deep.property('tanks.fuel.currentLevel', 30.280);
    tree.should.have.deep.property('tanks.fuel.capacity', 49.0);
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
});



