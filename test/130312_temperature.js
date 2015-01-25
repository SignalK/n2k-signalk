var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);
var debug = require('debug')('n2k-signalk:test:130312');


var msgs = require('./130310-2.json');

describe('130312 with Inside Temperature', function() {
  debug(JSON.stringify(msgs[9], null, 2));

  var delta = require("../n2kMapper.js").toDelta(msgs[9]);
  debug(JSON.stringify(delta, null, 2));

  delta.context = 'vessels.123456789';
  var multiplexer = new(require('signalk-multiplexer'))('123456789', 'uuid');
  multiplexer.add(delta);
  var tree = multiplexer.retrieve();
  debug(JSON.stringify(tree, null, 2));

  it(' has correct value', function() {
    tree.vessels['123456789'].should.have.deep.property('living.insideTemperature.value', 13.18);
  });

  it(' is valid SignalK', function() {
    delete tree.vessels['123456789'].uuid;
    tree.vessels['123456789'].should.be.validSignalK;
  });
});