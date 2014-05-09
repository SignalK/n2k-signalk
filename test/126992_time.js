var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));


describe('126992 system time', function () {
  it('complete sentence converts', function () {
    var msgs = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2013-10-08-16:04:06.044","prio":"3","src":"1","dst":"255","pgn":"126992","description":"System Time","fields":{"SID":"222","Date":"2013.10.08", "Time": "16:04:00"}}'));
    msgs.length.should.equal(2);
    msgs.should.contain.an.item.with.deep.property('environment.time');
    msgs.should.contain.an.item.with.deep.property('environment.time.value', '16:04:00');
    msgs.should.contain.an.item.with.deep.property('environment.date');
    msgs.should.contain.an.item.with.deep.property('environment.date.value', '2013.10.08');
  });
});






