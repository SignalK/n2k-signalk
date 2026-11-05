//ALERT TEXT
import { PGN_126985 } from '@canboat/ts-pgns'
import { AlertState, AlertText, alertKey } from './alerts.js'

const debug = require('debug')('n2k-signalk-126985')

module.exports = [
  {
    filter: function (n2k: PGN_126985, state?: AlertState) {
      if (typeof state !== 'undefined') {
        const key = alertKey(n2k.fields)
        const description = n2k.fields.alertTextDescription
        if (
          description === undefined ||
          description === null ||
          description === ''
        ) {
          // No text to store. Keep any earlier text for this alert: 126983
          // needs it to write the alert, including its return to normal.
          return false
        }
        const text: AlertText = {
          languageId: n2k.fields.languageId,
          textDescription: description,
          locationTextDescription: n2k.fields.alertLocationTextDescription || ''
        }
        //store the alert text in state for use with PGN 126983
        if (!state.alerts) {
          state.alerts = {}
        }
        state.alerts[key] = text

        if (debug.enabled) {
          debug('set alert state text: ' + JSON.stringify(text))
        }
      }
      return false
    },
    source: 'alertText'
  }
]
