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


describe('Temperature: ', function() {
  it("examples work", function() {
    var n2kMapper = require("../n2kMapper.js");
    var full = new(require('signalk-schema').FullSignalK)();
    _.forOwn(msgs, function(msg, key) {
      var delta = n2kMapper.toDelta(msg);
      delta.context = 'vessels.urn:mrn:imo:mmsi:230099999';
      full.addDelta(delta);
      delta.should.be.validSignalKDelta;
      delta.updates[0].values.forEach(function(pathValue) {
      })
    })
    var fullDoc = full.retrieve();
    fullDoc.vessels['urn:mrn:imo:mmsi:230099999'].mmsi = '230099999';
    fullDoc.should.be.validSignalK;
  })

  it("all 130312 mappings are valid", function() {
    var temperatureMappings = require("../n2kMappings").temperatureMappings;
    var full = new(require('signalk-schema').FullSignalK)();
    _.forOwn(temperatureMappings, function(mapping, key) {
      var delta = {
        context: 'vessels.urn:mrn:imo:mmsi:230099999',
        updates: [{
          source: {
            "label": "",
            "type": "NMEA2000",
            "pgn": 130312,
            "src": "36",
            "instance": "0"
          },
          timestamp: '',
          values: [{
            path: mapping.path,
            value: 0
          }]
        }]
      }
      full.addDelta(delta);
    })
    var fullDoc = full.retrieve();
    fullDoc.vessels['urn:mrn:imo:mmsi:230099999'].mmsi = '230099999';
    fullDoc.should.be.validSignalK;
  })
});
