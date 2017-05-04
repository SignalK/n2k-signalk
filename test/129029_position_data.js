var chai = require("chai");
chai.Should();
chai.use(require('signalk-schema').chaiModule);

var msg = JSON.parse('{"timestamp":"2017-04-15T15:50:48.664Z","prio":3,"src":3,"dst":255,"pgn":129029,"description":"GNSS Position Data","fields":{"SID":22,"Date":"2017.04.15", "Time": "15:50:48.04950","Latitude":39.0536632,"Longitude":-76.3972731,"GNSS type":"GPS+GLONASS","Method":"GNSS Fix","Integrity":"No integrity checking","Number of SVs":18,"HDOP":0.73,"Geoidal Separation":-0.01, "Altitude": 1.0, "PDOP":1.20, "Age of DGNSS Corrections": 30, "Reference Station ID": 22, "list":[{}]}}');

describe('129029 Position Data ', function () {
  it('complete sentence converts', function () {
    var tree = require("../n2kMapper.js").toNested(msg);
    tree.navigation.position.longitude.should.equal(-76.3972731);
    tree.navigation.position.latitude.should.equal(39.0536632);
    tree.navigation.gnss.antennaAltitude.value.should.equal(1.0);
    tree.navigation.gnss.satellites.value.should.equal(18);
    tree.navigation.gnss.horizontalDilution.value.should.equal(0.73);
    tree.navigation.gnss.positionDilution.value.should.equal(1.20);
    tree.navigation.gnss.geoidalSeparation.value.should.equal(-0.01);
    tree.navigation.gnss.differentialAge.value.should.equal(30);
    tree.navigation.gnss.differentialReference.value.should.equal(22);
    tree.navigation.gnss.type.value.should.equal("Combined GPS/GLONASS");
    tree.navigation.gnss.methodQuality.value.should.equal("GNSS Fix");
    tree.navigation.gnss.integrity.value.should.equal("no Integrity checking");
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
});
