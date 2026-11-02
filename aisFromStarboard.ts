// NMEA 2000 reports the AIS reference point as an unsigned distance from
// the starboard side. Signal K's sensors.*.fromCenter is measured from the
// centerline, +ve to starboard, so subtract the half beam.
type AisFrame = {
  fields: { positionReferenceFromStarboard?: number; beam?: number }
}

export = function (n2k: AisFrame) {
  var fromStarboard = Number(n2k.fields.positionReferenceFromStarboard)
  var width = Number(n2k.fields.beam)
  return width / 2 - fromStarboard
}
