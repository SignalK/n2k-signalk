var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));


describe('129291 set & drift rapid update', function () {
  it('complete sentence converts', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2014-08-15-18:00:06.573","prio":"3","src":"160","dst":"255","pgn":"129291","description":"Set & Drift, Rapid Update","fields":{"Set Reference":"True","Set":"212.6","Drift":"0.24"}}'));
    tree.should.have.deep.property('navigation.setTrue');
    tree.should.have.deep.property('navigation.setTrue.value', 212.6);
    tree.should.have.deep.property('navigation.drift');
    tree.should.have.deep.property('navigation.drift.value', 0.24);
  });
});


