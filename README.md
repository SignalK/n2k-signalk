

n2k-signalk
================
[![Build Status](https://travis-ci.org/SignalK/n2k-signalk.svg?branch=master)](https://travis-ci.org/SignalK/n2k-signalk)


NMEA 2000 to Signal K (signalk.github.io) converter. Converts [Canboat analyzer](https://github.com/canboat/canboat/wiki/analyzer) JSON output to [SignalK](http://signalk.github.io/) JSON.

For mapping NMEA 0183 data to SignalK see [nmea0183-signalk](https://github.com/SignalK/nmea0183-signalk).


USAGE
-------------

**Usage from command line**


```
$ actisense-serial /dev/actisense | analyzer -json 2>/dev/null | n2k-signalk | head -5
{"environment":{"windSpeedApparent":{"value":2.93,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.384","src":"105"}}}}
{"environment":{"windAngleApparent":{"value":341.4,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.384","src":"105"}}}}
{"environment":{"windSpeedApparent":{"value":2.93,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.385","src":"105"}}}}
{"environment":{"windAngleApparent":{"value":341.4,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.385","src":"105"}}}}
{"environment":{"windSpeedApparent":{"value":2.93,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.385","src":"105"}}}}
$ actisense-serial /dev/actisense | analyzer -json 2>/dev/null | n2k-signalk --flat | head -5
{"path":"environment.windSpeedApparent","value":2.93,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.384","src":"105"}}
{"path":"environment.windAngleApparent","value":341.4,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.384","src":"105"}}
{"path":"environment.windSpeedApparent","value":2.93,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.385","src":"105"}}
{"path":"environment.windAngleApparent","value":341.4,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.385","src":"105"}}
{"path":"environment.windSpeedApparent","value":2.93,"source":{"pgn":"130306","timestamp":"2013-08-24-15:31:50.385","src":"105"}}
```



**Usage as stream transformer**

See [bin/n2k-signalk](https://github.com/SignalK/n2k-signalk/blob/master/bin/n2k-signalk).

**Usage for a single transformation**

See [bin/demo.js](https://github.com/SignalK/n2k-signalk/blob/master/bin/demo.js).


### Custom Sentences

You can add custom n2k mappings via the [Signal K Server plugin mechanism](https://github.com/SignalK/signalk-server/blob/master/SERVERPLUGINS.md). A plugin can register custom mappings by emitting `pgn-to-signalk` PropertyValues with a value that is a map with the pgn number has the key and the n2k mappings as the value.

See [signalk-over-n2k](https://github.com/SignalK/signalk-over-n2k) for an example.
