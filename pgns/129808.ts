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

import {
  PGN_129808,
  PGN_129808_DscDistressAcknowledgementOrRelay,
  PGN_129808_DscDistressCallInformation
} from '@canboat/ts-pgns'
import { isPosition } from '../utils.js'

// The fields of all three variants: a mapping here reads both names.
type Dsc = {
  fields: Partial<
    PGN_129808['fields'] &
      PGN_129808_DscDistressCallInformation['fields'] &
      PGN_129808_DscDistressAcknowledgementOrRelay['fields']
  >
}

const NATURES: Record<string, string> = {
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
function addressMmsi(address: unknown) {
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
function isDistress(n2k: Dsc) {
  return (
    (n2k.fields.dscFormat as unknown) === 'Distress' ||
    (n2k.fields.dscCategory as unknown) === 'Distress' ||
    (n2k.fields.dscCategorySymbol as unknown) === 'Distress'
  )
}

// The vessel the call is about. A distress relay or acknowledgement (a call
// of category Distress, from a station passing it on) carries the ship in
// distress's position and nature, and names that ship in its own field. Any
// other call is about its caller.
function vesselMmsi(n2k: Dsc) {
  return (
    (isDistress(n2k) && addressMmsi(n2k.fields.mmsiOfShipInDistress)) ||
    addressMmsi(n2k.fields.dscMessageAddress)
  )
}

function distressNature(n2k: Dsc) {
  return (
    NATURES[n2k.fields.natureOfDistress as unknown as string] || 'undesignated'
  )
}

module.exports = [
  {
    node: 'navigation.position',
    filter: (n2k: Dsc) =>
      isPosition(
        n2k.fields.latitudeOfVesselReported,
        n2k.fields.longitudeOfVesselReported
      ),
    value: (n2k: Dsc) => ({
      latitude: Number(n2k.fields.latitudeOfVesselReported),
      longitude: Number(n2k.fields.longitudeOfVesselReported)
    })
  },
  {
    node: (n2k: Dsc) => 'notifications.' + distressNature(n2k),
    filter: isDistress,
    value: (n2k: Dsc) => ({
      message:
        'DSC Distress Received! Nature of distress: ' + distressNature(n2k)
    })
  },
  // No filter: a call without a valid address gives no context, so the mapper
  // drops it instead of reporting another station's position as our own.
  {
    context: (n2k: Dsc) => {
      const mmsi = vesselMmsi(n2k)
      return mmsi === undefined ? undefined : 'vessels.urn:mrn:imo:mmsi:' + mmsi
    }
  }
]
