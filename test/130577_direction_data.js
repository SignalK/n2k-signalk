var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);


describe('130577 direction_data sentence without drift', function() {
  var tree = require("../n2kMapper.js").toNested(
    JSON.parse('{"timestamp":"2014-08-15-10:01:35.236","prio":"3","src":"160","dst":"255","pgn":"130577","description":"Direction Data","fields":{"Data Mode":"Autonomous","COG Reference":"True","SID":"21","COG":"70.1","SOG":"0.01"}}'));
  it('has correct values', function() {
    tree.should.have.deep.property('navigation.speedOverGround');
    tree.should.have.deep.property('navigation.speedOverGround.value', 0.01);
    tree.should.have.deep.property('navigation.courseOverGroundTrue.value', 70.1);
    tree.should.have.deep.property('navigation.courseOverGroundTrue.value', 70.1);
  });
  it('is valid SignalK', function() {
    console.log(JSON.stringify(tree,null, 2));
    tree.should.be.validSignalK;
  });
});

describe('130577 direction_data sentence with drift', function() {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2014-08-15-18:00:00.755","prio":"3","src":"160","dst":"255","pgn":"130577","description":"Direction Data","fields":{"Data Mode":"Autonomous","COG Reference":"True","SID":"84","COG":"206.9","SOG":"3.51","Set":"58.9","Drift":"0.28"}}'));
  it('has correct values', function() {
    tree.should.have.deep.property('navigation.speedOverGround');
    tree.should.have.deep.property('navigation.speedOverGround.value', 3.51);
    tree.should.have.deep.property('navigation.courseOverGroundTrue');
    tree.should.have.deep.property('navigation.courseOverGroundTrue.value', 206.9);
    tree.should.have.deep.property('navigation.current.setTrue', 58.9);
    tree.should.have.deep.property('navigation.current.drift', 0.28);
  });
  it('is valid SignalK', function() {
    tree.should.be.validSignalK;
  });
});