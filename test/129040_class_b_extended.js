var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);

var mapper = require("../n2kMapper.js");


describe('129040 AIS Class B Extended Position Repeat', function () {
  it('complete sentence converts', function () {
    var msg = JSON.parse('{"timestamp":"2014-08-15-15:01:01.881","prio":"6","src":"43","dst":"255","pgn":"129040","description":"AIS Class B Extended Position Report","fields":{"Message ID":"5","Repeat indicator":"Initial","User ID":"230939100","Name":"RESCUE RAUTAUOMA","Type of ship":"SAR","Length":"16.0","Beam":"4.0","Position reference from Starboard":"2.0","Position reference from Bow":"9.0","ETA Date":"2014.11.30", "ETA Time": "25:00:00","Draft":"1.00","Destination":"HELSINKI LIFEBOAT","AIS version indicator":"ITU-R M.1371-1","GNSS type":"GPS","DTE":"available","Reserved":"0","AIS Transceiver information":"Channel B VDL reception", "True Heading": "158.0","Longitude":"25.2026083","Latitude":"60.2176150","COG":"154.0","SOG":"2.26"}}');
    var delta = mapper.toDelta(msg);
    delta.updates.length.should.equal(1);
    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:230939100');
    delta.updates[0].values[0].path.should.equal('');
    delta.updates[0].values[0].value.name.should.equal('RESCUE RAUTAUOMA');
    var tree = mapper.toNested(msg);
    tree.should.have.deep.property('design.length.overall.value', 16.0);
    tree.should.have.deep.property('design.type.value', "SAR");
    tree.should.have.deep.property('design.beam.value', 4.0);
    tree.should.have.deep.property('navigation.destination.name.value', "HELSINKI LIFEBOAT");
    tree.navigation.position.longitude.should.equal(25.2026083);
    tree.navigation.position.latitude.should.equal(60.2176150);
    tree.should.have.deep.property('navigation.courseOverGroundTrue');
    tree.should.have.deep.property('navigation.courseOverGroundTrue.value', 154.0);
    tree.should.have.deep.property('navigation.speedOverGround');
    tree.should.have.deep.property('navigation.speedOverGround.value', 2.26);
    tree.should.have.deep.property('navigation.headingTrue.value', 158.0);
  });
});
