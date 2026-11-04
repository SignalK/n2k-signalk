//ALERT TEXT
import { PGN_126985 } from '@canboat/ts-pgns'

const debug = require('debug')('n2k-signalk-126985')

/** An alert's text, as 126985 stores it in the per-source state for 126983. */
export interface AlertText {
  languageId: unknown
  textDescription: unknown
  locationTextDescription: unknown
}

/** The per-source state 126985 and 126983 share. */
export interface AlertState {
  alerts?: Record<number, AlertText>
}

module.exports = [
  {
    filter: function (n2k: PGN_126985, state?: AlertState) {
      if (typeof state !== 'undefined') {
        const alertId = n2k.fields.alertId as number
        const text: AlertText = {
          languageId: n2k.fields.languageId,
          textDescription: n2k.fields.alertTextDescription,
          locationTextDescription: n2k.fields.alertLocationTextDescription || ''
        }
        //store the alert text in state for use with PGN 126983
        if (!state.alerts) {
          state.alerts = {}
        }
        state.alerts[alertId] = text

        if (debug.enabled) {
          debug('set alert state text: ' + JSON.stringify(text))
        }
      }
      return false
    },
    source: 'alertText'
  }
]
