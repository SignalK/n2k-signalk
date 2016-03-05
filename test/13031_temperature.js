var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);
var debug = require('debug')('n2k-signalk:test:130312');


var msgs = require('./130310-2.json');

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
