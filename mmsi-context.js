
module.exports = function(n2k) {
  return 'vessels.urn:mrn:imo:mmsi:' + n2k.fields['User ID'];
}

