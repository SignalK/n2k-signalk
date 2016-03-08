var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);
var debug = require('debug')('n2k-signalk:test:130312');
var _ = require('lodash');


var msgs = require('./130310-2.json');

/*
describe('130312 with Inside Temperature', function() {
  console.log(JSON.stringify(msgs['130312-insidetemp'], null, 2));

  var tree = require("../n2kMapper.js").toNested(msgs['130312-insidetemp']);
  console.log(tree)
  it(' has correct value', function() {
    tree.should.have.deep.property('environment.temperature.inside.value', 13.18);
  });

  it('is valid SignalK', function() {
    tree.should.be.validSignalKVesselIgnoringIdentity;
  });
});
*/


describe('temps', function() {
  it("works", function() {
    var n2kMapper = require("../n2kMapper.js");
    var full = new (require('signalk-schema').FullSignalK)();
    _.forOwn(msgs, function(msg, key) {
//      console.log(key);
      var delta = n2kMapper.toDelta(msg);
//      console.log(JSON.stringify(delta, null, 2));
      delta.context = 'vessels.urn:mrn:imo:mmsi:230099999';
      full.addDelta(delta);
      delta.should.be.validSignalKDelta
      delta.updates[0].values.forEach(function(pathValue){
//        console.log(" " + pathValue.path + ":" + pathValue.value)
      })
    })
//    console.log(JSON.stringify(full.retrieve(), null, 2));
  })
});
