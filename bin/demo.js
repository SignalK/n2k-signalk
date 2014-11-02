#!/usr/bin/env node

var n2kMapper = require('../n2kMapper.js');
var msg = {
  "timestamp": "2013-10-08-15:47:28.263",
  "prio": "2",
  "src": "204",
  "dst": "255",
  "pgn": "127251",
  "description": "Rate of Turn",
  "fields": {
    "Rate": "0.0066071"
  }
};

console.log(JSON.stringify(n2kMapper.toDelta(msg)));
console.log(JSON.stringify(n2kMapper.toNested(msg)));