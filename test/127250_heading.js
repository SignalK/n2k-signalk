var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));


describe('127250 Heading', function () {
  it('Magnetic sentence converts', function () {
    var msg = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2013-10-08-15:47:28.263","prio":"2","src":"204","dst":"255","pgn":"127250","description":"Vessel Heading","fields":{"Heading":"129.7","Reference":"Magnetic"}}'));
    msg.length.should.equal(1);
    msg.should.contain.an.item.with.deep.property('navigation.headingMagnetic.value', 129.7);
  });

  it('Variation sentence converts', function () {
    var msg = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2013-10-08-15:47:28.264","prio":"2","src":"1","dst":"255","pgn":"127250","description":"Vessel Heading","fields":{"SID":"68","Variation":"8.0","Reference":"True"}}'));
    msg.length.should.equal(1);
    msg.should.contain.an.item.with.deep.property('navigation.magneticVariation.value', 8);
  });
});




