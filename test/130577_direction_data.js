var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));


describe('130577 direction_data', function () {
  it('sentence without drift converts', function () {
    var msgs = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2014-08-15-10:01:35.236","prio":"3","src":"160","dst":"255","pgn":"130577","description":"Direction Data","fields":{"Data Mode":"Autonomous","COG Reference":"True","SID":"21","COG":"70.1","SOG":"0.01"}}'));
    msgs.length.should.equal(2);
    msgs.should.contain.an.item.with.deep.property('navigation.speedOverGround');
    msgs.should.contain.an.item.with.deep.property('navigation.speedOverGround.value', 0.01);
    msgs.should.contain.an.item.with.deep.property('navigation.courseOverGroundTrue');
    msgs.should.contain.an.item.with.deep.property('navigation.courseOverGroundTrue.value', 70.1);
  });
  it('sentence with drift converts', function () {
    var msgs = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2014-08-15-18:00:00.755","prio":"3","src":"160","dst":"255","pgn":"130577","description":"Direction Data","fields":{"Data Mode":"Autonomous","COG Reference":"True","SID":"84","COG":"206.9","SOG":"3.51","Set":"58.9","Drift":"0.28"}}'));
    msgs.length.should.equal(4);
    msgs.should.contain.an.item.with.deep.property('navigation.speedOverGround');
    msgs.should.contain.an.item.with.deep.property('navigation.speedOverGround.value', 3.51);
    msgs.should.contain.an.item.with.deep.property('navigation.courseOverGroundTrue');
    msgs.should.contain.an.item.with.deep.property('navigation.courseOverGroundTrue.value', 206.9);
    msgs.should.contain.an.item.with.deep.property('navigation.set');
    msgs.should.contain.an.item.with.deep.property('navigation.set.value', 58.9);
    msgs.should.contain.an.item.with.deep.property('navigation.drift');
    msgs.should.contain.an.item.with.deep.property('navigation.drift.value', 0.28);
  });
});



