var n2kMappings = require("./n2kMappings.js").mappings;
var through = require('through');
var debug = require('debug')('signalk:n2k-signalk')


var toDelta = function (n2k) {
  debug(JSON.stringify(n2k));
  var theMappings = n2kMappings[n2k.pgn];
  var result =
    {
      updates: [
        {
          source: {
            label: '',
            type: 'NMEA2000',
            pgn: n2k.pgn,
            timestamp: n2k.timestamp,
            src: n2k.src
          },
          values : toValuesArray(theMappings, n2k)
        }
      ]
    };
  if (typeof theMappings != 'undefined') {
    theMappings.forEach(function(mapping) {
      if (typeof mapping.context === 'function') {
        result.context = mapping.context(n2k);
      }
    });
  }
  debug(JSON.stringify(result));
  return result;
}

function getValue(n2k, theMapping) {
  if (typeof theMapping.source != 'undefined') {
    var stringValue = n2k.fields[theMapping.source];
    var numberValue = Number(stringValue);
    return isNaN(numberValue) ? stringValue : numberValue;
  } else {
    return theMapping.value(n2k);
  }
}

var toValuesArray = function (theMappings, n2k) {
  if (typeof theMappings != 'undefined') {
    return theMappings
      .filter(function (theMapping) {
        try {
          return typeof theMapping.filter === 'undefined' || theMapping.filter(n2k);
        } catch (ex) {
          process.stderr.write(ex + ' ' + n2k);
          return false;
        }
      })
      .map(function (theMapping) {
        try {
          return typeof theMapping.node === 'function' ?
            {
              path: theMapping.node(n2k),
              value: typeof theMapping.source != 'undefined' ?
                Number(n2k.fields[theMapping.source]) :
                theMapping.value(n2k)
            } :
            {
              path: theMapping.node,
              value: getValue(n2k, theMapping)
            }
          }
        } catch (ex) {
          process.stderr.write(ex + ' ' + n2k);
        }
      })
      .filter(function (x) {
        return x != undefined;
      });
  }
  return [];
}

var addToTree = function (pathValue, source, tree) {
  var result = {};
  var temp = tree;
  var parts = msg.path.split('.');
  for (var i = 0; i < parts.length - 1; i++) {
    temp[parts[i]] = {};
    temp = temp[parts[i]];
  }
  temp[parts[parts.length - 1]] = msg;
  return result;
}


function addAsNested(pathValue, source, timestamp, result) {
  var temp = result;
  var parts = pathValue.path.split('.');
  for (var i = 0; i < parts.length - 1; i++) {
    if (typeof temp[parts[i]] === 'undefined') {
      temp[parts[i]] = {};
    }
    temp = temp[parts[i]];
  };

  //mapping produced an object like {latitude:...,longitude:...}
  if (typeof pathValue.value === 'object') {
    temp[parts[parts.length - 1]] = pathValue.value;
    temp[parts[parts.length - 1]].source = source;
    temp[parts[parts.length - 1]].timestamp = timestamp + '';
  } else {
    temp[parts[parts.length - 1]] = {
      value:  pathValue.value,
      source: source,
      timestamp: timestamp + ''
    };
  }
}

function deltaToNested(delta) {
  var result = {};
  var timestamp = delta.updates[0].source.timestamp;
  delete delta.updates[0].source.timestamp;
  delta.updates[0].values.forEach(function(pathValue) {
    addAsNested(pathValue, delta.updates[0].source, timestamp, result);
  });
  return result;
}

exports.toDelta = toDelta;
exports.toNested = function (n2k) {
  return deltaToNested(toDelta(n2k));
}

exports.toDeltaTransformer = function (options) {
  var stream = through(function (data) {
    if (options.debug) {
      console.log(data);
    }
    stream.queue(exports.toDelta(data));
  });
  return stream;
}

exports.toNestedTransformer = function (options) {
  var stream = through(function (data) {
    if (options.debug) {
      console.log(data);
    }
    var nested = exports.toNested(data);
    if (Object.getOwnPropertyNames(nested).length > 0) {
      stream.queue(nested);
    }
  });
  return stream;
}
