module.exports = [
  {
    filter: function (n2k, state) {
      if ( state ) {
        state.productInformation = {
          productName: n2k.fields['Model ID'],
          hardwareVersion: n2k.fields['Model Version'],
          softwareVersion: n2k.fields['Software Version Code'],
          productID: n2k.fields['Product Code'],
          serialNumber: n2k.fields['Model Serial Code'],
          nmea2000Version: n2k.fields['NMEA 2000 Version'],
          certificationLevel: n2k.fields['Certification Level'],
          loadEquivalency: n2k.fields['Load Equivalency']
        }
      }
      return false
    }
  }
]
