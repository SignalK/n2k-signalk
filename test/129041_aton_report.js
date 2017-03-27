var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);

var mapper = require("../n2kMapper.js");


describe('129041 AIS Aids to Navigation (AtoN) Report', function () {
  it('complete sentence converts', function () {
    var msg = JSON.parse('{"timestamp":"2017-03-14T19:02:40.451Z","prio":4,"src":43,"dst":255,"pgn":129041,"description":"AIS Aids to Navigation (AtoN) Report","fields":{"Message ID":21,"Repeat Indicator":"Initial","User ID":993672315,"Longitude":-76.3847132,"Latitude":38.9938400,"Position Accuracy":"High","AIS RAIM Flag":"not in use","Time Stamp":"Manual input mode","AtoN Type":"Fixed beacon: port hand","Off Position Indicator":"No","Virtual AtoN Flag":"Yes","Assigned Mode Flag":"Autonomous and continuous","AIS Spare":"0","Position Fixing Device Type":"Surveyed","AtoN Status":"0","AIS Transceiver information":"Channel B VDL reception","AtoN Name":"SW                  @"}}');
    var delta = mapper.toDelta(msg);
    delta.updates.length.should.equal(1);
    delta.context.should.equal('atons.urn:mrn:imo:mmsi:993672315');
    delta.updates[0].values[0].path.should.equal('');
    delta.updates[0].values[0].value.name.should.equal('SW                  @');
    var tree = mapper.toNested(msg);
    tree.should.have.deep.property('atonType.value', "Fixed beacon: port hand");
    tree.navigation.position.latitude.should.equal(38.9938400);
    tree.navigation.position.longitude.should.equal(-76.3847132);
    //tree.should.be.validSignalKAtoNIgnoringIdentity;
  });
});
