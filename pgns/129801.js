/*
 * PGN 129801 "AIS Addressed Safety Related Message" — the free-text safety
 * message an AIS station sends to one specific MMSI rather than broadcasting
 * it: a coast station calling a single vessel, a ship-to-ship safety call.
 *
 * Companion to PGN 129802 (the broadcast variant, added in #333). Emits the
 * text under the sending station's MMSI context, following the same
 * `communication.ais.*` namespace, plus the addressee so a consumer can tell
 * whether the message was directed at own vessel.
 */

function senderMmsi (n2k) {
  const id = n2k.fields.sourceId
  if (id === undefined || id === null || Number(id) === 0) {
    return undefined
  }
  // Coast stations carry 00-prefixed MMSIs that arrive numerically (leading
  // zeros dropped). Pad back to 9 digits so the context is a valid MMSI.
  return id.toString().padStart(9, '0')
}

function addresseeMmsi (n2k) {
  const id = n2k.fields.destinationId
  if (id === undefined || id === null || Number(id) === 0) {
    return undefined
  }
  return id.toString().padStart(9, '0')
}

function safetyText (n2k) {
  const text = n2k.fields.safetyRelatedText
  return typeof text === 'string' && text.trim().length > 0
    ? text.trim()
    : undefined
}

module.exports = [
  {
    node: 'communication.ais.safetyRelatedAddressed',
    filter: n2k => typeof safetyText(n2k) !== 'undefined',
    value: n2k => safetyText(n2k)
  },
  {
    node: 'communication.ais.safetyRelatedAddressee',
    filter: n2k => typeof addresseeMmsi(n2k) !== 'undefined',
    value: n2k => addresseeMmsi(n2k)
  },
  {
    context: n2k => 'vessels.urn:mrn:imo:mmsi:' + senderMmsi(n2k),
    filter: n2k => typeof senderMmsi(n2k) !== 'undefined'
  }
]
