module.exports = [
  {
    filter: function (n2k, state) {
      if ( state ) {
        state.configurationInformation = {
          installationNote1: n2k.fields['Installation Description #1'],
          installationNote2: n2k.fields['Installation Description #2'],
          installationNote3: n2k.fields['Installation Description #3'],
          manufacturerInfo: n2k.fields['Manufacturer Information'],
        }
      }
      return false
    }
  }
]
