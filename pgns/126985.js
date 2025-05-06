//ALERT TEXT
const debug = require('debug')('n2k-signalk-126985')

module.exports = [
  {
    filter: function (n2k, state) {
      if (typeof state !== 'undefined') {
        var alertId = n2k.fields.alertId
        var text = {
          languageId: n2k.fields.languageId,
          textDescription: n2k.fields.alertTextDescription,
          locationTextDescription: n2k.fields.alertLocationTextDescription || ''
        }
        //store the alert text in state for use with PGN 126983
        if (!state.alerts) {
          state.alerts = {}
        }
        state.alerts[alertId] = text

        debug('set alert state text: ' + JSON.stringify(text))
      }
      return false
    },
    source: 'alertText'
  }
]
