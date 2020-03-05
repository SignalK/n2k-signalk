//ALERT TEXT
const debug = require('debug')('n2k-signalk-126985')

module.exports = [{
  node: function(n2k, state) {
      if (typeof state !== 'undefined') {
        var alertId = n2k.fields['Alert ID']
        var text = {
          [alertId]: {
            languageId: n2k.fields['Language ID'],
            textDescription: n2k.fields['Alert Text Description'],
            locationTextDescription: n2k.fields['Alert Location Text Description'] || ''
          }
        }
        //store the alert text in state for use with PGN 126983
        state.alerts = text

        debug('set alert state text: ' + JSON.stringify(text))
      }
      return true
  },
  source: 'Alert Text'
}]
