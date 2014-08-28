var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));


describe('128259 speed', function () {
  it('complete sentence converts', function () {
    var msgs = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2014-08-15-18:00:30.175","prio":"2","src":"115","dst":"255","pgn":"128259","description":"Speed","fields":{"SID":"0","Speed Water Referenced":"3.47","Speed Water Referenced Type":"-0"}}'));
    msgs.length.should.equal(1);
    msgs.should.contain.an.item.with.deep.property('navigation.speedThroughWater');
    msgs.should.contain.an.item.with.deep.property('navigation.speedThroughWater.value', 3.47);
  });
});



