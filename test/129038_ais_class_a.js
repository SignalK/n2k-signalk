var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);

var mapper = require("../n2kMapper.js");


describe('129038 Class A Update', function () {
  it('complete sentence converts', function () {
    var msg = JSON.parse('{"timestamp":"2014-08-15-15:00:01.665","prio":"4","src":"43","dst":"255","pgn":"129038","description":"AIS Class A Position Report","fields":{"Message ID":"1","Repeat Indicator":"Initial","User ID":"230982000","Longitude":"25.2026083","Latitude":"60.2176150","Position Accuracy":"High","RAIM":"not in use","Time Stamp":"0","COG":"154.0","SOG":"2.26","Communication State":"2286","AIS Transceiver information":"Channel B VDL reception","Heading":"153.0","Rate of Turn":"0.047","Nav Status":"Under way using engine"}}');
    var tree = mapper.toNested(msg);
    tree.should.have.deep.property('navigation.courseOverGroundTrue');
    tree.should.have.deep.property('navigation.courseOverGroundTrue.value', 154.0);
    tree.should.have.deep.property('navigation.speedOverGround');
    tree.should.have.deep.property('navigation.speedOverGround.value', 2.26);
    tree.navigation.position.longitude.should.equal(25.2026083);
    tree.navigation.position.latitude.should.equal(60.2176150);
    tree.should.be.validSignalKVesselIgnoringIdentity;
    var delta = mapper.toDelta(msg);
    delta.updates.length.should.equal(1);
    delta.context.should.equal('vessels.230982000');
  });
});

/*
 {
 "timestamp": "2014-08-15-15:00:01.665",
 "prio": "4",
 "src": "43",
 "dst": "255",
 "pgn": "129038",
 "description": "AIS Class A Position Report",
 "fields": {
 "Message ID": "1",
 "Repeat Indicator": "Initial",
 "User ID": "230982000",
 "Longitude": "25.2026083",
 "Latitude": "60.2176150",
 "Position Accuracy": "High",
 "RAIM": "not in use",
 "Time Stamp": "0",
 "COG": "154.0",
 "SOG": "2.26",
 "Communication State": "2286",
 "AIS Transceiver information": "Channel B VDL reception",
 "Heading": "153.0",
 "Rate of Turn": "0.047",
 "Nav Status": "Under way using engine"
 }
 */



