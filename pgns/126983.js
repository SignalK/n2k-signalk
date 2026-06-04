// ALERT
const debug = require('debug')('n2k-signalk-126983')

const alertTypes = [
  {
    nmea: 'Emergency Alarm',
    sk: 'emergency'
  },
  {
    nmea: 'Alarm',
    sk: 'alarm'
  },
  {
    nmea: 'Warning',
    sk: 'warn'
  },
  {
    nmea: 'Caution',
    sk: 'alert'
  }
]

// Devices in the wild emit non-spec ALERT_TYPE values (e.g. 4) that
// canboatjs returns as raw integers. Default those to Caution → 'alert'
// so the notification still surfaces at the lowest severity.
const defaultAlertType = alertTypes[alertTypes.length - 1]

function resolveAlertType (rawAlertType) {
  if (typeof rawAlertType === 'string') {
    for (var i = 0; i < alertTypes.length; i++) {
      if (alertTypes[i].nmea === rawAlertType) return alertTypes[i]
    }
  }
  return defaultAlertType
}

module.exports = [
  {
    node: function (n2k, state) {
      var resolved = resolveAlertType(n2k.fields.alertType)
      var alertType = resolved.nmea.replace(/ /g, '').toLowerCase()

      var alertCategory =
        typeof n2k.fields.alertCategory === 'string'
          ? n2k.fields.alertCategory.toLowerCase()
          : ''

      var path =
        'notifications.nmea.' +
        alertType +
        '.' +
        alertCategory +
        '.' +
        n2k.fields.alertSystem +
        '.' +
        n2k.fields.alertId
      debug('126983 path: ' + path)

      return path
    },
    value: function (n2k, state) {
      debug('126983 value')

      var resolved = resolveAlertType(n2k.fields.alertType)
      debug('126983 skstate: ' + resolved.sk)

      var alertId = n2k.fields.alertId

      var value = {
        state: resolved.sk,
        method: ['visual', 'sound'],
        message: state.alerts[alertId].textDescription,
        location: state.alerts[alertId].locationTextDescription || '',
        alertType: n2k.fields.alertType,
        alertCategory: n2k.fields.alertCategory,
        alertSystem: n2k.fields.alertSystem,
        alertId: n2k.fields.alertId,
        dataSourceNetworkIDNAME: n2k.fields.dataSourceNetworkIdName,
        dataSourceInstance: n2k.fields.dataSourceInstance,
        'dataSourceIndex-Source': n2k.fields.dataSourceIndexSource,
        occurrence: n2k.fields.alertOccurrenceNumber,
        temporarySilenceStatus: n2k.fields.temporarySilenceStatus,
        acknowledgeStatus: n2k.fields.acknowledgeStatus,
        escalationStatus: n2k.fields.escalationStatus,
        temporarySilenceSupport: n2k.fields.temporarySilenceSupport,
        acknowledgeSupport: n2k.fields.acknowledgeSupport,
        escalationSupport: n2k.fields.escalationSupport,
        acknowledgeSourceNetworkIDNAME:
          n2k.fields.acknowledgeSourceNetworkIdName,
        triggerCondition: n2k.fields.triggerCondition,
        thresholdStatus: n2k.fields.thresholdStatus,
        alertPriority: n2k.fields.alertPriority,
        alertState: n2k.fields.alertState
      }

      //if the alert is silenced or acknowledged then dont alert in SK
      if (
        n2k.fields.temporarySilenceStatus == 'Yes' ||
        n2k.fields.acknowledgeStatus == 'Yes'
      ) {
        value.method = []
      }
      if (debug.enabled) {
        debug('126983 value: ' + JSON.stringify(value, null, 2))
      }

      return value
    },
    filter: function (n2k, state) {
      return (
        n2k.fields.alertType !== undefined &&
        n2k.fields.alertType !== null &&
        typeof state === 'object' &&
        state.alerts &&
        state.alerts[n2k.fields.alertId]
      )
    }
  }
]
