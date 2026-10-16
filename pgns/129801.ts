import { PGN_129801 } from '@canboat/ts-pgns'

/*
 * PGN 129801 "AIS Addressed Safety Related Message" — the free-text safety
 * message an AIS station sends to one specific MMSI rather than broadcasting
 * it: a coast station calling a single vessel, a ship-to-ship safety call.
 *
 * Companion to PGN 129802 (the broadcast variant, added in #333). Emits the
 * message under the sending station's MMSI context, following the same
 * `communication.ais.*` namespace, as one object value holding the text and
 * the addressee, so a consumer can tell whether the message was directed at
 * own vessel. Text and addressee travel together: as two paths, a message
 * without an addressee would leave the previous message's addressee standing
 * next to the new text.
 */

// Coast stations carry 00-prefixed MMSIs that arrive numerically (leading
// zeros dropped). Pad back to 9 digits so the MMSI is valid.
function mmsi (id: unknown): string | undefined {
  if (id === undefined || id === null || Number(id) === 0) {
    return undefined
  }
  return id.toString().padStart(9, '0')
}

function safetyText (n2k: PGN_129801): string | undefined {
  const text = n2k.fields.safetyRelatedText
  return typeof text === 'string' && text.trim().length > 0
    ? text.trim()
    : undefined
}

function message (n2k: PGN_129801) {
  const value: { text?: string; addressee?: string } = {
    text: safetyText(n2k)
  }
  const addressee = mmsi(n2k.fields.destinationId)
  if (addressee !== undefined) {
    value.addressee = addressee
  }
  return value
}

module.exports = [
  {
    node: 'communication.ais.safetyRelatedAddressed',
    filter: (n2k: PGN_129801) => typeof safetyText(n2k) !== 'undefined',
    value: message
  },
  {
    context: (n2k: PGN_129801) =>
      'vessels.urn:mrn:imo:mmsi:' + mmsi(n2k.fields.sourceId),
    filter: (n2k: PGN_129801) =>
      typeof mmsi(n2k.fields.sourceId) !== 'undefined'
  }
]
