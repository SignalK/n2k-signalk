var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);



describe('128259 speed', function () {
  it('complete sentence converts', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2014-08-15-18:00:30.175","prio":"2","src":"115","dst":"255","pgn":"128259","description":"Speed","fields":{"SID":"0","Speed Water Referenced":"3.47","Speed Water Referenced Type":"-0"}}'));
    tree.should.have.deep.property('navigation.speedThroughWater');
    tree.should.have.deep.property('navigation.speedThroughWater.value', 3.47);
    tree.should.be.validSignalKVessel;
  });
});



