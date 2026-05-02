/*
 * Humidity source enumeration from PGN 130313 (HUMIDITY_SOURCE):
 *   {"0": "Inside"},
 *   {"1": "Outside"}
 *
 * Each humidity reading carries an Instance number alongside the
 * Source enum, so a device can publish multiple readings of the same
 * category (e.g. two interior humidity sensors on a B&G CLM100).
 *
 * `environment.inside.*` is a zoneObject pattern in the Signal K
 * schema that accepts arbitrary subkeys, so unscoped Inside sensors
 * are indexed (`environment.inside.<index>.relativeHumidity`).
 * `environment.outside.humidity` has a fixed schema position; sensors
 * there share the bare path and disambiguation relies on the priority
 * engine's `$source` matching.
 */
module.exports = {
  Inside: {
    pathWithIndex: 'environment.inside.<index>.relativeHumidity'
  },
  Outside: {
    path: 'environment.outside.humidity'
  }
}
