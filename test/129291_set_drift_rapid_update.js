var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);


describe('129291 set & drift rapid update complete sentence', function() {
  var tree = require("../n2kMapper.js").toNested(
    JSON.parse('{"timestamp":"2014-08-15-18:00:06.573","prio":"3","src":"160","dst":"255","pgn":"129291","description":"Set & Drift, Rapid Update","fields":{"Set Reference":"True","Set":"212.6","Drift":"0.24"}}'));
  it('result has correct values', function() {
    tree.should.have.deep.property('environment.current.setTrue');
    tree.should.have.deep.property('environment.current.setTrue', 212.6);
    tree.should.have.deep.property('environment.current.drift');
    tree.should.have.deep.property('environment.current.drift', 0.24);
  });
  it('result is valid SignalK', function() {
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
});


