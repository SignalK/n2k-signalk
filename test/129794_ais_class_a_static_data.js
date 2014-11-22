

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
    var msg = JSON.parse('{"timestamp":"2014-08-15-15:01:01.881","prio":"6","src":"43","dst":"255","pgn":"129794","description":"AIS Class A Static and Voyage Related Data","fields":{"Message ID":"5","Repeat indicator":"Initial","User ID":"230939100","IMO number":"0","Callsign":"OJ7510","Name":"RESCUE RAUTAUOMA","Type of ship":"SAR","Length":"16.0","Beam":"4.0","Position reference from Starboard":"2.0","Position reference from Bow":"9.0","ETA Date":"2014.11.30", "ETA Time": "25:00:00","Draft":"1.00","Destination":"HELSINKI LIFEBOAT","AIS version indicator":"ITU-R M.1371-1","GNSS type":"GPS","DTE":"available","Reserved":"0","AIS Transceiver information":"Channel B VDL reception"}}');
    var delta = mapper.toDelta(msg);
    console.log(JSON.stringify(delta));
    delta.updates.length.should.equal(1);
    delta.updates[0].context.should.equal('vessels.230939100');
    delta.updates[0].values[0].path.should.equal('name');
    delta.updates[0].values[0].value.should.equal('RESCUE RAUTAUOMA');
  });
});
