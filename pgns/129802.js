/*
 * PGN 129802 "AIS Safety Related Broadcast Message" — the free-text safety
 * broadcast any AIS station can send: coast-station MAYDAY relays, navigation
 * warnings, "SART ACTIVE", etc. Broadcast to every AIS receiver in range.
 *
 * Emits the broadcast text under the sending station's MMSI context. SignalK
 * has no standard path for an AIS safety broadcast, so this proposes
 * `communication.ais.safetyRelatedBroadcast` — open to maintainer guidance on
 * the canonical location.
 */

function senderMmsi (n2k) {
  const id = n2k.fields.sourceId
  if (id === undefined || id === null || Number(id) === 0) {
    return undefined
  }
  // Coast stations — the senders of MAYDAY relays — carry 00-prefixed MMSIs
  // that arrive numerically (leading zeros dropped). Pad back to 9 digits so
  // the context is a valid MMSI.
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
    node: 'communication.ais.safetyRelatedBroadcast',
    filter: n2k => typeof safetyText(n2k) !== 'undefined',
    value: n2k => safetyText(n2k)
  },
  {
    context: n2k => 'vessels.urn:mrn:imo:mmsi:' + senderMmsi(n2k),
    filter: n2k => typeof senderMmsi(n2k) !== 'undefined'
  }
]
