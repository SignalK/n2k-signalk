var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);


describe('65345 Seatalk Wind Datum', function () {
  it('complet wind datum sentence converts positive', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2016-09-06T23:01:38.825Z","prio":7,"src":204,"dst":255,"pgn":65345,"description":"Seatalk: Pilot Wind Datum","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Wind Datum":1.0265,"Rolling Average Wind Angle":5.0195}}'));
    tree.should.have.deep.property('steering.autopilot.target.windAngleApparent.value', 1.0265);
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });

  it('complet wind datum sentence converts negative', function () {
    var tree = require("../n2kMapper.js").toNested(
      JSON.parse('{"timestamp":"2016-09-06T23:01:38.825Z","prio":7,"src":204,"dst":255,"pgn":65345,"description":"Seatalk: Pilot Wind Datum","fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry","Wind Datum":5.1454,"Rolling Average Wind Angle":5.0195}}'));
    tree.should.have.deep.property('steering.autopilot.target.windAngleApparent.value', -1.1377853071795858);
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });  
});
