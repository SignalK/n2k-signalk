module.exports = [
  {
    filter: function (n2k, state) {
      if ( state ) {
        state.deviceInformation = {
          uniqueId: n2k.fields['Unique Number'],
          manufacturerName: n2k.fields['Manufacturer Code'],
          deviceFunction: n2k.fields['Device Function'],
          deviceClass: n2k.fields['Device Class'],
          deviceInstanceLower: n2k.fields['Device Instance Lower'],
          deviceInstanceUpper: n2k.fields['Device Instance Upper'],
          systemInstance: n2k.fields['System Instance']
        }
      }
      return false
    }
  }
]
