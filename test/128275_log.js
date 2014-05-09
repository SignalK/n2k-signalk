var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));


describe('128275 log', function () {
  it('complete sentence converts', function () {
    var msgs = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2013-10-08-16:04:06.060","prio":"6","src":"1","dst":"255","pgn":"128275","description":"Distance Log","fields":{"Log":"2229808","Trip Log":"4074"}}'));
    msgs.length.should.equal(2);
    msgs.should.contain.an.item.with.deep.property('navigation.logTrip');
    msgs.should.contain.an.item.with.deep.property('navigation.logTrip.value', 4074);
    msgs.should.contain.an.item.with.deep.property('navigation.log');
    msgs.should.contain.an.item.with.deep.property('navigation.log.value', 2229808);
  });
});



