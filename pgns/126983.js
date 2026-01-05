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

module.exports = [
  {
    node: function (n2k, state) {
      var alertType = n2k.fields.alertType.replace(/ /g, '').toLowerCase()

      var alertCategory = (n2k.fields.alertCategory || '').toLowerCase()

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

      var skstate = alertTypes.filter(
        alertType => alertType.nmea === n2k.fields.alertType
      )
      debug('126983 skstate: ' + skstate[0].sk)

      var alertId = n2k.fields.alertId

      var value = {
        state: skstate[0].sk,
        method: ['visual', 'sound'],
        message: state.alerts[alertId].textDescription,
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
      debug('126983 value: ' + JSON.stringify(value, null, 2))

      return value
    },
    filter: function (n2k, state) {
      return (
        n2k.fields.alertType &&
        typeof state === 'object' &&
        state.alerts &&
        state.alerts[n2k.fields.alertId]
      )
    }
  }
]
