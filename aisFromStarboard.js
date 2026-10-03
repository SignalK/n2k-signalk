// NMEA 2000 reports the AIS reference point as an unsigned distance from
// the starboard side. Signal K's sensors.*.fromCenter is measured from the
// centerline, +ve to starboard, so subtract the half beam.
module.exports = function (n2k) {
  var fromStarboard = n2k.fields.positionReferenceFromStarboard
  var width = n2k.fields.beam
  return width / 2 - fromStarboard
}
