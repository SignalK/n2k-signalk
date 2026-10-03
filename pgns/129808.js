/*
 * PGN 129808 "DSC Call Information" — VHF Digital Selective Calling.
 *
 * canboatjs (useCamel) resolves the DSC_FORMAT / DSC_CATEGORY / DSC_NATURE
 * lookups to their names. canboat models two field variants of this PGN: the
 * distress variant (dscFormat/dscCategory/natureOfDistress) and the general
 * variant (dscFormatSymbol/dscCategorySymbol) — read both.
 *
 * Mirrors the NMEA 0183 $--DSC hook: the reported position and a
 * nature-of-distress notification are emitted under the MMSI context of the
 * vessel the call is about: the ship in distress for a distress relay or
 * acknowledgement, the calling station otherwise.
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

// A DSC address is a DECIMAL field: canboat gives it as a 10 digit string.
// Per ITU-R M.493 it is the station's 9 digit MMSI followed by a 0 (a ship
// MIDxxxxxx becomes MIDxxxxxx0, a coast station 00MIDxxxx becomes 00MIDxxxx0),
// so the MMSI is its first 9 digits. Kept a string, so leading zeros survive.
function addressMmsi (address) {
  if (typeof address !== 'string' || !/^\d{10}$/.test(address)) {
    return undefined
  }
  const mmsi = address.slice(0, 9)
  return mmsi === '000000000' ? undefined : mmsi
}

// The vessel the call is about. A distress relay or acknowledgement comes
// from the station passing it on; the position and nature it carries are the
// ship in distress's, which is named in its own field. Any other call is
// about its caller.
function vesselMmsi (n2k) {
  return (
    addressMmsi(n2k.fields.mmsiOfShipInDistress) ||
    addressMmsi(n2k.fields.dscMessageAddress)
  )
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
  // No filter: a call without a valid address gives no context, so the mapper
  // drops it instead of reporting another station's position as our own.
  {
    context: n2k => {
      const mmsi = vesselMmsi(n2k)
      return mmsi === undefined ? undefined : 'vessels.urn:mrn:imo:mmsi:' + mmsi
    }
  }
]
