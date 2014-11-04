#!/usr/bin/env node

var n2kMapper = require('../n2kMapper.js');
var msg = {
  "timestamp": "2013-10-08T15:47:28.263Z",
  "prio": "2",
  "src": "204",
  "dst": "255",
  "pgn": "127251",
  "description": "Rate of Turn",
  "fields": {
    "Rate": "0.0066071"
  }
};



console.log(".toDelta()\n----------");
console.log(JSON.stringify(n2kMapper.toDelta(msg), null, 2));
console.log("\n.toNested()\n-----------");
console.log(JSON.stringify(n2kMapper.toNested(msg), null, 2));
