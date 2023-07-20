// ALERT
const debug = require('debug')('n2k-signalk-126983')

const alertTypes = [{
    "nmea": "Emergency Alarm",
    "sk": "emergency"
  },
  {
    "nmea": "Alarm",
    "sk": "alarm"
  },
  {
    "nmea": "Warning",
    "sk": "warn"
  },
  {
    "nmea": "Caution",
    "sk": "alert"
  }
]

module.exports = [{
  node: function(n2k, state) {
    var alertType = n2k.fields['Alert Type'].replace(/ /g, '').toLowerCase()

    var alertCategory = n2k.fields['Alert Category'].toLowerCase()

    var path = 'notifications.nmea.' + alertType + '.' + alertCategory + '.' + n2k.fields['Alert System'] + '.' + n2k.fields['Alert ID']
    debug('126983 path: ' + path)

    return path
  },
  value: function(n2k, state) {
    debug('126983 value')

    var skstate = alertTypes.filter(alertType => alertType.nmea === n2k.fields['Alert Type'])
    debug('126983 skstate: ' + skstate[0].sk)

    var alertId = n2k.fields['Alert ID']

    var value = {
      "state": skstate[0].sk,
      "method": [
        "visual",
        "sound"
      ],
      "message": state.alerts[alertId].textDescription,
      "alertType": n2k.fields['Alert Type'],
      "alertCategory": n2k.fields['Alert Category'],
      "alertSystem": n2k.fields['Alert System'],
      "alertId": n2k.fields['Alert ID'],
      "dataSourceNetworkIDNAME": n2k.fields['Data Source Network ID NAME'],
      "dataSourceInstance": n2k.fields['Data Source Instance'],
      "dataSourceIndex-Source": n2k.fields['Data Source Index-Source'],
      "occurrence": n2k.fields['Alert Occurrence Number'],
      "temporarySilenceStatus": n2k.fields['Temporary Silence Status'],
      "acknowledgeStatus": n2k.fields['Acknowledge Status'],
      "escalationStatus": n2k.fields['Escalation Status'],
      "temporarySilenceSupport": n2k.fields['Temporary Silence Support'],
      "acknowledgeSupport": n2k.fields['Acknowledge Support'],
      "escalationSupport": n2k.fields['Escalation Support'],
      "acknowledgeSourceNetworkIDNAME": n2k.fields['Acknowledge Source Network ID NAME'],
      "triggerCondition": n2k.fields['Trigger Condition'],
      "thresholdStatus": n2k.fields['Threshold Status'],
      "alertPriority": n2k.fields['Alert Priority'],
      "alertState": n2k.fields['Alert State']
    }

    //if the alert is silenced or acknowledged then dont alert in SK
    if (n2k.fields['Temporary Silence Status'] == 'Yes' ||
      n2k.fields['Acknowledge Status'] == 'Yes') {
      value.method = []
    }
    debug('126983 value: ' + JSON.stringify(value))

    return value
  },
  filter: function(n2k, state) {
    return (
      n2k.fields['Alert Type'] &&
      typeof state === 'object' &&
      state.alerts &&
      state.alerts[n2k.fields['Alert ID']]
    )
  }
}]
