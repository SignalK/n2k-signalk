var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);



describe('128267_water_depth', function () {
  it('complete sentence converts', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2013-10-08-15:47:28.280","prio":"3","src":"1","dst":"255","pgn":"128267","description":"Water Depth","fields":{"SID":"91","Depth":"8.20", "Offset":0.304}}'));
    tree.should.have.deep.property('environment.depth.belowTransducer');
    tree.should.have.deep.property('environment.depth.belowTransducer.value', 8.20);
    tree.should.have.deep.property('environment.depth.surfaceToTransducer');
    tree.should.have.deep.property('environment.depth.surfaceToTransducer.value', 0.304);
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
});



