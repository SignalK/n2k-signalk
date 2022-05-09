
module.exports.getMmsiContext = function (n2k) {
  return typeof n2k.fields['User ID'] !== 'undefined' ? 'vessels.urn:mrn:imo:mmsi:' + n2k.fields['User ID'] : undefined
}

function padUserID(n2k) {
  let id = n2k.fields['User ID']
  if ( typeof id !== 'undefined' ) {
    id = id.toString()
    return id != '0' ? id.padStart(9, '0') : id
  }
}

module.exports.padUserID = padUserID
