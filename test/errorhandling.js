const chai = require("chai");
chai.Should();
const assert = require('assert')
const mapper = require("../n2kMapper.js")

describe('Unknown pgn', function() {
  it('returns delta with one update that has no values', function() {
    var delta = mapper.toDelta(JSON.parse('{"timestamp":"2013-10-08-16:04:06.044","prio":"3","src":"1","dst":"255","pgn":"999999","description":"System Time","fields":{"SID":"222","Date":"2013.10.08", "Time": "16:04:00"}}'));
    assert.equal(delta.updates[0].values.length, 0)
  });
});


describe('No fields in pgn message', function() {
  it('does not throw any errors', function() {
    //  missing User Id
    //  var msg = JSON.parse('{"timestamp":"2014-08-15-15:01:01.881","prio":"6","src":"43","dst":"255","pgn":"129794","description":"AIS Class A Static and Voyage Related Data","fields":{"Message ID":"5","Repeat indicator":"Initial","User ID":"230939100","IMO number":"0","Callsign":"OJ7510","Name":"RESCUE RAUTAUOMA","Type of ship":"SAR","Length":"16.0","Beam":"4.0","Position reference from Starboard":"2.0","Position reference from Bow":"9.0","ETA Date":"2014.11.30", "ETA Time": "25:00:00","Draft":"1.00","Destination":"HELSINKI LIFEBOAT","AIS version indicator":"ITU-R M.1371-1","GNSS type":"GPS","DTE":"available","Reserved":"0","AIS Transceiver information":"Channel B VDL reception"}}');
    var msg = {
      "timestamp": "2014-08-15-15:01:01.881",
      "prio": "6",
      "src": "43",
      "dst": "255",
      "pgn": "129794",
      "description": "AIS Class A Static and Voyage Related Data"
    }
    mapper.toDelta(msg).updates.length.should.equal(0)
  });
});
