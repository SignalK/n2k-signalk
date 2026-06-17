/*
 * PGN 129808 "DSC Call Information" — VHF Digital Selective Calling.
 *
 * canboatjs (useCamel) resolves the DSC_FORMAT / DSC_CATEGORY / DSC_NATURE
 * lookups to their names. canboat models two field variants of this PGN: the
 * distress variant (dscFormat/dscCategory/natureOfDistress) and the general
 * variant (dscFormatSymbol/dscCategorySymbol) — read both.
 *
 * Mirrors the NMEA 0183 $--DSC hook: the reported position and a
 * nature-of-distress notification are emitted under the calling station's
 * MMSI context.
 */

const NATURES = {
  Fire: 'fire',
  Flooding: 'flooding',
  Collision: 'collision',
  Grounding: 'grounding',
  Listing: 'listing',
  Sinking: 'sinking',
  'Disabled and adrift': 'adrift',
  Undesignated: 'undesignated',
  'Abandoning ship': 'abandon',
  Piracy: 'piracy',
  'Man overboard': 'mob',
  'EPIRB emission': 'epirb'
}

function callerMmsi (n2k) {
  const address = n2k.fields.dscMessageAddress
  if (address === undefined || address === null || Number(address) === 0) {
    return undefined
  }
  return address.toString()
}

function isDistress (n2k) {
  return (
    n2k.fields.dscCategory === 'Distress' ||
    n2k.fields.dscCategorySymbol === 'Distress'
  )
}

function distressNature (n2k) {
  return NATURES[n2k.fields.natureOfDistress] || 'undesignated'
}

module.exports = [
  {
    node: 'navigation.position',
    filter: n2k =>
      typeof n2k.fields.latitudeOfVesselReported === 'number' &&
      typeof n2k.fields.longitudeOfVesselReported === 'number',
    value: n2k => ({
      latitude: n2k.fields.latitudeOfVesselReported,
      longitude: n2k.fields.longitudeOfVesselReported
    })
  },
  {
    node: n2k => 'notifications.' + distressNature(n2k),
    filter: isDistress,
    value: n2k => ({
      message:
        'DSC Distress Received! Nature of distress: ' + distressNature(n2k)
    })
  },
  {
    context: n2k => 'vessels.urn:mrn:imo:mmsi:' + callerMmsi(n2k),
    filter: n2k => typeof callerMmsi(n2k) !== 'undefined'
  }
]
