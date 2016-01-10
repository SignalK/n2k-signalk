var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));


describe('126992 system time', function () {
  it('complete sentence converts', function () {
    var tree = require("../n2kMapper.js").toFullVessel(
      JSON.parse('{"timestamp":"2013-10-08-16:04:06.044","prio":"3","src":"1","dst":"255","pgn":"126992","description":"System Time","fields":{"SID":"222","Date":"2013.10.08", "Time": "16:04:00"}}'));
    tree.should.have.deep.property('environment.time');
    tree.should.have.deep.property('environment.time.value', '16:04:00');
    tree.should.have.deep.property('environment.date');
    tree.should.have.deep.property('environment.date.value', '2013.10.08');
  });
});






