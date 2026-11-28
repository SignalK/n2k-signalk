//ALERT TEXT
import { PGN_126985 } from '@canboat/ts-pgns'
import { AlertState, AlertText, alertKey } from './alerts.js'

const debug = require('debug')('n2k-signalk-126985')

// An alert's text is kept until the alert is back to normal. A source that
// sends texts for ever new alerts, and not their return to normal, would grow
// the state for as long as it is connected, so keep the texts of the alerts
// heard most recently only: far more than a device has active at once.
const MAX_ALERT_TEXTS = 256

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
        // A text heard again becomes the most recent one. The keys are kept
        // in the order they were stored: none of them is an integer.
        delete state.alerts[key]
        state.alerts[key] = text
        const keys = Object.keys(state.alerts)
        if (keys.length > MAX_ALERT_TEXTS) {
          delete state.alerts[keys[0]]
        }

        if (debug.enabled) {
          debug('set alert state text: ' + JSON.stringify(text))
        }
      }
      return false
    },
    source: 'alertText'
  }
]
