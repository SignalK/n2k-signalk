var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);

describe('127250 Heading', function () {
  it('Magnetic sentence converts', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2013-10-08-15:47:28.263","prio":"2","src":"204","dst":"255","pgn":"127250","description":"Vessel Heading","fields":{"Heading":"129.7","Reference":"Magnetic"}}'));
    tree.should.have.with.deep.property('navigation.headingMagnetic.value', 129.7);
    tree.should.be.validSignalK;
  });

  it('Variation sentence converts', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2013-10-08-15:47:28.264","prio":"2","src":"1","dst":"255","pgn":"127250","description":"Vessel Heading","fields":{"SID":"68","Variation":"8.0","Reference":"True"}}'));
    tree.should.have.with.deep.property('navigation.magneticVariation.value', 8);
    tree.should.be.validSignalK;
  });
});




