type MmsiFrame = { fields: { userId?: number | string } }

export function getMmsiContext(n2k: MmsiFrame) {
  return n2k.fields.userId != null
    ? 'vessels.urn:mrn:imo:mmsi:' + n2k.fields.userId
    : undefined
}

export function padUserID(n2k: MmsiFrame) {
  let id = n2k.fields.userId
  if (typeof id !== 'undefined') {
    id = id.toString()
    return id != '0' ? id.padStart(9, '0') : id
  }
}
