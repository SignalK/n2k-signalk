
const transceiverInformation = 'AIS Transceiver information'

module.exports = function (n2k) {
  if ( transceiverInformation in n2k.fields ) {
    const val = n2k.fields[transceiverInformation]
    if ( val && val === 'Channel A VDL transmission' || val === 'Channel B VDL transmission' || val === 'Own information not broadcast' ) {
      return undefined
    }
  }
  return 'vessels.urn:mrn:imo:mmsi:' + n2k.fields['User ID']
}
