// PGN 129041 (AtoN) names its dimension fields differently from the vessel
// AIS PGNs: positionReferenceFromStarboardEdge / beamDiameter rather than
// positionReferenceFromStarboard / beam. Signal K's sensors.*.fromCenter is
// measured from the centerline, +ve to starboard, so subtract the half beam.
module.exports = function (n2k) {
  var fromStarboardEdge = n2k.fields.positionReferenceFromStarboardEdge
  var width = n2k.fields.beamDiameter
  return width / 2 - fromStarboardEdge
}
