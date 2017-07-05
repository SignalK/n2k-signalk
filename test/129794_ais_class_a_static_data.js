

/*
 {
 "timestamp": "2014-08-15-15:01:01.881",
 "prio": "6",
 "src": "43",
 "dst": "255",
 "pgn": "129794",
 "description": "AIS Class A Static and Voyage Related Data",
 "fields": {
 "Message ID": "5",
 "Repeat indicator": "Initial",
 "User ID": "230939100",
 "IMO number": "0",
 "Callsign": "OJ7510",
 "Name": "RESCUE RAUTAUOMA",
 "Type of ship": "SAR",
 "Length": "16.0",
 "Beam": "4.0",
 "Position reference from Starboard": "2.0",
 "Position reference from Bow": "9.0",
 "ETA Date": "2014.11.30",
 "ETA Time": "25:00:00",
 "Draft": "1.00",
 "Destination": "HELSINKI LIFEBOAT",
 "AIS version indicator": "ITU-R M.1371-1",
 "GNSS type": "GPS",
 "DTE": "available",
 "Reserved": "0",
 "AIS Transceiver information": "Channel B VDL reception"
 }
 }
 */

var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);

var mapper = require("../n2kMapper.js");


describe('129794 AIS Class A Static and Voyage Related Data', function () {
  it('complete sentence converts', function () {
    var msg = JSON.parse('{"timestamp":"2017-03-13T18:30:56.945Z","prio":6,"src":43,"dst":255,"pgn":129794,"description":"AIS Class A Static and Voyage Related Data","fields":{"Message ID":5,"Repeat indicator":"Initial","User ID":356307000,"IMO number":9683362,"Callsign":"3FJJ4","Name":"SILVER GWEN","Type of ship":"Tanker hazard cat C","Length":183.0,"Beam":32.0,"Position reference from Starboard":8.0,"Position reference from Bow":147.0,"ETA Date":"2018.03.11", "ETA Time": "07:00:00","Draft":10.60,"Destination":"USA (BALTIMORE)","AIS version indicator":"ITU-R M.1371-3","GNSS type":"GPS","DTE":"available","AIS Transceiver information":"Channel A VDL reception"}}');
    var delta = mapper.toDelta(msg);
    delta.updates.length.should.equal(1);
    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:356307000');
    delta.updates[0].values[0].path.should.equal('');
    delta.updates[0].values[0].value.name.should.equal('SILVER GWEN');
    //console.log(JSON.stringify(delta, null, 2))
    var tree = mapper.toNested(msg);
    tree.should.have.nested.property('design.draft.maximum', 10.6);
    tree.should.have.nested.property('design.length.overall', 183.0);
    tree.should.have.nested.property('design.aisShipType.value', 83);
    tree.should.have.nested.property('design.beam.value', 32.0);
    tree.should.have.nested.property('navigation.destination.commonName.value', 'USA (BALTIMORE)')
    tree.should.have.nested.property('sensors.ais.fromBow.value', 147.0);
    tree.should.have.nested.property('sensors.ais.fromCenter.value', 8);
    delete tree.design.aisShipType;
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
});
