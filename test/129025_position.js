var chai = require("chai");
chai.Should();
chai.use(require('signalk-schema').chaiModule);

describe('129025 Position, rapid update ', function () {
  it('complete sentence converts', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2013-10-08-15:47:28.264","prio":"2","src":"2","dst":"255","pgn":"129025","description":"Position, Rapid Update","fields":{"Latitude":"60.1445540","Longitude":"24.7921348"}}'));
    tree.navigation.position.longitude.should.equal(24.7921348);
    tree.navigation.position.latitude.should.equal(60.144554);
    tree.should.be.validSignalKVessel;
  });

});
