
module.exports = function (n2k) {
  return typeof n2k.fields['User ID'] !== 'undefined' ? 'vessels.urn:mrn:imo:mmsi:' + n2k.fields['User ID'] : undefined
}
