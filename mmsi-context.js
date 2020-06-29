
module.exports = function (n2k) {
  return n2k.fields['User ID'] ? 'vessels.urn:mrn:imo:mmsi:' + n2k.fields['User ID'] : undefined
}
