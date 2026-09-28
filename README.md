

n2k-signalk
================
[![Build Status](https://travis-ci.org/SignalK/n2k-signalk.svg?branch=master)](https://travis-ci.org/SignalK/n2k-signalk)


NMEA 2000 to Signal K converter. Converts [Canboat analyzer](https://github.com/canboat/canboat/wiki/analyzer) JSON output to the [Signal K](http://signalk.github.io/) data format (also JSON).

This package is part of [signalk-server](https://github.com/SignalK/signalk-server). Not a plugin. It can also be used outside of signalk-server. See Usage section below.

For mapping NMEA 0183 data to the Signal K data format, see [nmea0183-signalk](https://github.com/SignalK/nmea0183-signalk).


USAGE
-------------

**Usage in signalk-server**

All data connections in signalk-server that are configured as type NMEA 2000 use this code.

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


### Instance Paths

PGNs that carry an instance number (engines, batteries, chargers, inverters, tanks, AC and DC connections, temperature, humidity and pressure sensors) write their data under a prefix built from that instance, such as `propulsion.port` or `electrical.batteries.3`.

Pass `instancePrefixResolver` to replace that prefix:

```js
const { N2kMapper } = require('@signalk/n2k-signalk')

const mapper = new N2kMapper({
  instancePrefixResolver: ({ group, discriminator, instance, src, canName }) =>
    group === 'engine' && instance === 0 ? 'propulsion.main' : undefined
})
```

The resolver is called with:

- `group`: the instance group id, e.g. `engine`, `battery`, `tank`, `temperature`, `dcConnection`
- `discriminator`: the numeric tank type or sensor source code, `undefined` for groups without one
- `instance`: the numeric instance code; an absent instance is its "no data" code (255, or 15 for tanks)
- `src`: the source address of the frame
- `canName`: the source's CAN name, `undefined` until its PGN 60928 has been seen

A non-empty string replaces the prefix, notifications included; anything else keeps the default. For temperature, humidity and pressure the prefix is the full leaf path, e.g. `environment.inside.engineRoom.temperature`. Engine alarm messages name a remapped engine by the prefix's last segment. The resolver is called once per frame and every path of that frame uses its result, so it should be pure. If it throws, the mapper catches the exception, drops that path's value and writes the error to stderr; the next path of the frame calls the resolver again.

The mapper reads `instancePrefixResolver` from its options object on every frame, so setting or deleting it on that object takes effect on the next frame.

The group vocabulary is exported so callers can build and validate rules without duplicating it:

- `instanceGroups`: one entry per group with its `id`, `pgns`, `instanceField`, `maxInstance`, `singleLeaf`, `discriminatorField` and `discriminatorCodes`
- `classifyInstance(n2k)`: `{ group, discriminator, instance }` for a decoded frame, or `undefined`
- `defaultPrefix(group, discriminator, instance, src, pgn?)`: the prefix written without a resolver
