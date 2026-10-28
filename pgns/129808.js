/*
 * PGN 129808 "DSC Call Information" — VHF Digital Selective Calling.
 *
 * canboatjs (useCamel) resolves the DSC_FORMAT / DSC_CATEGORY / DSC_NATURE
 * lookups to their names. canboat models three variants of this PGN: a
 * distress alert (format Distress; dscFormat/dscCategory/natureOfDistress), a
 * distress acknowledgement or relay (category Distress) and any other call,
 * the last two with dscFormatSymbol/dscCategorySymbol — read both names.
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

// A DSC address is a DECIMAL field, kept a string so leading zeros survive.
// Per ITU-R M.493 a DSC call sends the station's 9 digit MMSI followed by a
// 0 (a ship MIDxxxxxx becomes MIDxxxxxx0, a coast station 00MIDxxxx becomes
// 00MIDxxxx0). canboatjs with canboat/canboatjs#538 (and canboat 9.1) drops
// that 0 and gives the 9 digit MMSI; older versions give all 10 digits, so
// the MMSI is then the first 9. Ten digits that don't end in 0 are not an
// MMSI: the newer decoder gives those for a call to a geographical area.
function addressMmsi (address) {
  if (typeof address !== 'string') {
    return undefined
  }
  let mmsi
  if (/^\d{9}$/.test(address)) {
    mmsi = address
  } else if (/^\d{9}0$/.test(address)) {
    mmsi = address.slice(0, 9)
  } else {
    return undefined
  }
  return mmsi === '000000000' ? undefined : mmsi
}

// A distress alert has format Distress, and no category of its own; a relay
// or acknowledgement has category Distress.
function isDistress (n2k) {
  return (
    n2k.fields.dscFormat === 'Distress' ||
    n2k.fields.dscCategory === 'Distress' ||
    n2k.fields.dscCategorySymbol === 'Distress'
  )
}

// The vessel the call is about. A distress relay or acknowledgement (a call
// of category Distress, from a station passing it on) carries the ship in
// distress's position and nature, and names that ship in its own field. Any
// other call is about its caller.
function vesselMmsi (n2k) {
  return (
    (isDistress(n2k) && addressMmsi(n2k.fields.mmsiOfShipInDistress)) ||
    addressMmsi(n2k.fields.dscMessageAddress)
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
