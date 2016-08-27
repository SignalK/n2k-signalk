var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);



describe('129283 cross track error', function () {
  it('complete engine params sentence converts', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2016-08-11T07:58:36.263Z","prio":3,"src":3,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"XTE mode":"Autonomous","Navigation Terminated":"No","XTE":-5.63}}'));
    tree.should.have.deep.property('navigation.course.crossTrackError');
    tree.should.have.deep.property('navigation.course.crossTrackError', -5.63);
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
});
