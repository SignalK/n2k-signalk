var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);

var mapper = require("../n2kMapper.js");


describe('130842 Simnet AIS Class B static data', function () {
  it('complete part A sentence converts', function () {
    var msg = JSON.parse('{"timestamp":"2017-03-13T18:32:13.343Z","prio":6,"src":43,"dst":255,"pgn":130842,"description":"Simnet: AIS Class B static data (msg 24 Part A)","fields":{"Manufacturer Code":"Simrad","Industry Code":"Marine Industry","Message ID":"Msg 24 Part A","Repeat indicator":"Second retransmission","E":24,"User ID":338184313,"Name":"WILHELM"}}');
    var delta = mapper.toDelta(msg);
    delta.updates.length.should.equal(1);
    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:338184313');
    delta.updates[0].values[0].path.should.equal('');
    delta.updates[0].values[0].value.name.should.equal('WILHELM');
    var tree = mapper.toNested(msg);
    tree.should.have.deep.property('mmsi', '338184313');
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
  it('complete part B sentence converts', function () {
    var msg = JSON.parse('{"timestamp":"2017-03-13T18:26:24.199Z","prio":6,"src":43,"dst":255,"pgn":130842,"description":"Simnet: AIS Class B static data (msg 24 Part B)","fields":{"Manufacturer Code":"Simrad","Industry Code":"Marine Industry","Message ID":"Msg 24 Part B","Repeat indicator":"Second retransmission","E":24,"User ID":338184313,"Type of ship":"Sailing","Vendor ID":"SMTD*:0","Callsign":"","Length":9.0,"Beam":4.0,"Position reference from Starboard":2.0,"Position reference from Bow":6.0,"Mothership User ID":0,"":0,"Spare":48}}');
    var delta = mapper.toDelta(msg);
    delta.updates.length.should.equal(1);
    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:338184313');
    var tree = mapper.toNested(msg);
    tree.should.have.deep.property('mmsi', '338184313');
    tree.should.have.deep.property('design.length.overall', 9.0);
    tree.should.have.deep.property('design.aisShipType.value', "Sailing");
    tree.should.have.deep.property('design.beam.value', 4.0);
    tree.should.have.deep.property('sensors.ais.fromBow.value', 6.0);
    tree.should.have.deep.property('sensors.ais.fromCenter.value', 0);
    delete tree.design.aisShipType;
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
});
