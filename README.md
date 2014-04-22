n2k-signalk
================

NMEA 2000 to Signal K (signalk.github.io) converter. Converts [Canboat analyzer](https://github.com/canboat/canboat/wiki/analyzer) JSON output to [SignalK](http://signalk.github.io/) JSON.

For mapping NMEA 0183 data to SignalK see [nmea0183-signalk](https://github.com/SignalK/nmea0183-signalk).


USAGE
-------------

**Usage from command line**


```
$ actisense-serial /dev/actisense | analyzer -json 2>/dev/null | n2k-signalk | head -5
{"environmental":{"windSpeedApparent":{"value":2.93,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.384","src":"105"}}}}
{"environmental":{"windAngleApparent":{"value":341.4,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.384","src":"105"}}}}
{"environmental":{"windSpeedApparent":{"value":2.93,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.385","src":"105"}}}}
{"environmental":{"windAngleApparent":{"value":341.4,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.385","src":"105"}}}}
{"environmental":{"windSpeedApparent":{"value":2.93,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.385","src":"105"}}}}
$ actisense-serial /dev/actisense | analyzer -json 2>/dev/null | n2k-signalk --flat | head -5
{"path":"environmental.windSpeedApparent","value":2.93,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.384","src":"105"}}
{"path":"environmental.windAngleApparent","value":341.4,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.384","src":"105"}}
{"path":"environmental.windSpeedApparent","value":2.93,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.385","src":"105"}}
{"path":"environmental.windAngleApparent","value":341.4,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.385","src":"105"}}
{"path":"environmental.windSpeedApparent","value":2.93,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.385","src":"105"}}
```



**Usage as stream transformer**

```javascript
process.stdin.pipe(JSONStream.parse()).pipe(n2kMappings.toFlatSignalKStream(opts)).pipe(JSONStream.stringify(false)).pipe(process.stdout);
```


**Usage for a single transformation**

```javascript
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

console.log(JSON.stringify(n2kMapper.toFlat(msg)));
console.log(JSON.stringify(n2kMapper.toNested(msg)));
```

