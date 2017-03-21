const chai = require("chai");
chai.Should();
const assert = require('assert')

describe('Unknown pgn', function () {
  it('returns delta with one update that has no values', function () {
    var delta = require("../n2kMapper.js").toDelta(JSON.parse('{"timestamp":"2013-10-08-16:04:06.044","prio":"3","src":"1","dst":"255","pgn":"999999","description":"System Time","fields":{"SID":"222","Date":"2013.10.08", "Time": "16:04:00"}}'));
    assert.equal(delta.updates[0].values.length, 0)
  });
});
