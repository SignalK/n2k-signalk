

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

PGNs that carry an instance number (engines, batteries, chargers, inverters, tanks, AC and DC connections, temperature, humidity and pressure sensors) write their data under a prefix built from that instance, such as `propulsion.port` or `electrical.batteries.3`. A mapper can replace that prefix with rules, with a resolver function, or both.

#### Rules

A rule writes one instance of one device under a prefix. The device is identified by two fields of its NAME, the identity it claims its address with in PGN 60928: the manufacturer code and the unique number. Together they are the NAME's low 32 bits (unique number in bits 0-20, manufacturer code in bits 21-31). The full NAME, the `canName` of deltas, also holds the device and system instances, which installers change (PGN 126208); a rule keyed by it would silently stop applying after such a change.

```js
const { N2kMapper } = require('@signalk/n2k-signalk')

const mapper = new N2kMapper()
const problems = mapper.setInstancePrefixRules([
  {
    manufacturerCode: 419, // Fusion Electronics
    uniqueNumber: 76223,
    group: 'engine',
    instance: 0,
    prefix: 'propulsion.main'
  },
  {
    manufacturerCode: 419,
    uniqueNumber: 76223,
    group: 'tank',
    discriminator: 0, // Fuel
    instance: 1,
    prefix: 'tanks.fuel.aft'
  }
])
```

- `manufacturerCode`: the numeric manufacturer code of the device's NAME, `0` to `2047`
- `uniqueNumber`: the unique number of the device's NAME, `0` to `2097151` (2^21 - 1)
- `group`: the instance group id, e.g. `engine`, `battery`, `tank`, `temperature`, `dcConnection`
- `discriminator`: the numeric tank type or sensor source code; required for `tank`, `temperature`, `humidity` and `pressure`, absent for the other groups
- `instance`: the numeric instance code, `0` to the group's `maxInstance`
- `prefix`: the prefix to write under. For temperature, humidity and pressure it is the full path of the value, leaf included, e.g. `environment.inside.engineRoomAft.temperature` or `propulsion.port.coolantTemperature`

`setInstancePrefixRules` replaces any earlier rules and applies the valid ones. It writes each problem of the others to stderr once and returns them as `{ index, message }` objects; `undefined`, `null` or `[]` removes every rule. A value that is not an array removes them too, and is one problem with `index` `-1`; it never throws, so a malformed `instancePrefixRules` option does not stop the mapper from being constructed. Two rules for the same device, group, discriminator and instance are a problem: the first applies. The `instancePrefixRules` constructor option is applied once, through the same setter.

`validateInstancePrefixRules(rules)` returns the same problems without applying anything: a rule that is not an object or has a field of the wrong type, an unknown group, a missing or unexpected discriminator, or one the group writes no path for, a manufacturer code, unique number or instance out of range, an empty prefix, and a rule with the same key as an earlier one.

`deviceIdentity(canName)` returns the `{ manufacturerCode, uniqueNumber }` of a `canName` as deltas carry it, or `undefined` for a value that is not one, so a caller keys rules for a source exactly as the mapper matches them.

The mapper recovers the manufacturer code from the manufacturer name the decoder puts in PGN 60928, through this package's `@canboat/ts-pgns`, so the decoder (canboatjs 4) must use the same `@canboat/ts-pgns` major version: a name missing from this package's table becomes code 2047, and rules for the device do not match. The mapper logs each such name once.

#### Resolver

A resolver function decides the prefix in code:

```js
mapper.setInstancePrefixResolver(
  ({ group, discriminator, instance, src, canName }) =>
    group === 'engine' && instance === 0 ? 'propulsion.main' : undefined
)
```

`setInstancePrefixResolver(undefined)` removes it. The `instancePrefixResolver` constructor option is applied once, through the same setter.

The resolver is called with:

- `group`, `discriminator`, `instance`: as in a rule; an absent instance is its "no data" code (255, or 15 for tanks)
- `src`: the source address of the frame
- `canName`: the source's CAN name, `undefined` until its PGN 60928 has been seen
- `manufacturerCode`, `uniqueNumber`: the device, as in a rule; `undefined` until its PGN 60928 has been seen

A non-empty string replaces the prefix; anything else keeps the default. The resolver should be pure. If it throws, the mapper writes every path of the frame under the default prefix, as if the resolver had returned nothing. It logs the error, with the PGN and source address, the first time the resolver throws for that PGN and source address in that mapper; a new resolver's errors are logged afresh.

#### How a frame's prefix is chosen

For each frame of an instance group, a matching rule wins; without one, the resolver is called; when it returns nothing, the default prefix applies. Rules and resolver are consulted once per frame, and every path of the frame uses the result, notifications included. Engine alarm messages name a remapped engine by the prefix's last segment.

Rules, and the resolver's `canName`, `manufacturerCode` and `uniqueNumber`, only apply once the mapper has seen the source's PGN 60928 address claim. Until then a device's data is written under the default prefix, even when a rule covers it: after a restart, its data appears on the default path first and on the rule's path once the claim arrives. A device that claims again with another device or system instance keeps matching its rules; another device that claims the same source address does not.

The J1939 engine PGNs (61444, 65226, 65262 and 65270) write `propulsion.<source address>`. They carry no instance and are not remapped.

#### Group vocabulary

The group vocabulary is exported so callers can build rules without duplicating it:

- `instanceGroups`: one entry per group with its `id`, `pgns`, `instanceField`, `maxInstance`, `instanceEnum`, `singleLeaf`, `discriminatorField`, `discriminatorEnum` and `discriminatorCodes`. `instanceEnum` and `discriminatorEnum` name the `@canboat/ts-pgns` enumerations that name the codes (`ENGINE_INSTANCE`, `TANK_TYPE`, `TEMPERATURE_SOURCE`...), `undefined` where the codes are plain numbers or the group has no discriminator. `discriminatorCodes` is the ascending array of discriminator codes the group writes a path for. Entries hold only strings, numbers, booleans, arrays and `undefined`, so they survive `JSON.stringify`, e.g. to feed a rule editor, except that keys whose value is `undefined` are omitted
- `classifyInstance(n2k)`: `{ group, discriminator, instance }` for a decoded frame, or `undefined`
- `defaultPrefix(group, discriminator, instance, src, pgn?)`: the prefix written without rules or a resolver
