// PGN 129041 (AtoN) names its dimension fields differently from the vessel
// AIS PGNs: positionReferenceFromStarboardEdge / beamDiameter rather than
// positionReferenceFromStarboard / beam. Signal K's sensors.*.fromCenter is
// measured from the centerline, +ve to starboard, so subtract the half beam.
type AtonFrame = {
  fields: { positionReferenceFromStarboardEdge?: number; beamDiameter?: number }
}

export = function (n2k: AtonFrame) {
  const fromStarboardEdge = Number(
    n2k.fields.positionReferenceFromStarboardEdge
  )
  const width = Number(n2k.fields.beamDiameter)
  return width / 2 - fromStarboardEdge
}
