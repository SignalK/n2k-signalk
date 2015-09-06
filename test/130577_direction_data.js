var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);


describe('130577 direction_data', function () {
  it('sentence without drift converts', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2014-08-15-10:01:35.236","prio":"3","src":"160","dst":"255","pgn":"130577","description":"Direction Data","fields":{"Data Mode":"Autonomous","COG Reference":"True","SID":"21","COG":"70.1","SOG":"0.01"}}'));
    tree.should.have.deep.property('navigation.speedOverGround');
    tree.should.have.deep.property('navigation.speedOverGround.value', 0.01);
    tree.should.have.deep.property('navigation.courseOverGroundTrue.value', 70.1);
    tree.should.have.deep.property('navigation.courseOverGroundTrue.value', 70.1);
    tree.should.be.validSignalKVessel;
  });
  it('sentence with drift converts', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2014-08-15-18:00:00.755","prio":"3","src":"160","dst":"255","pgn":"130577","description":"Direction Data","fields":{"Data Mode":"Autonomous","COG Reference":"True","SID":"84","COG":"206.9","SOG":"3.51","Set":"58.9","Drift":"0.28"}}'));
    tree.should.have.deep.property('navigation.speedOverGround');
    tree.should.have.deep.property('navigation.speedOverGround.value', 3.51);
    tree.should.have.deep.property('navigation.courseOverGroundTrue');
    tree.should.have.deep.property('navigation.courseOverGroundTrue.value', 206.9);
    tree.should.have.deep.property('navigation.current.setTrue');
    tree.should.have.deep.property('navigation.current.setTrue.value', 58.9);
    tree.should.have.deep.property('navigation.current.drift');
    tree.should.have.deep.property('navigation.current.drift.value', 0.28);
    tree.should.be.validSignalKVessel;
  });
});



