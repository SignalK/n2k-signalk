/* Transmission Parameters, Dynamic
 *
 * 1. Transmission instance:        port or starboard
 * 2. Transmission gear:            propulsion.«instance».transmission.gear
 * 3. Reserved (byte alignment)
 * 4. Transmission oil pressure:    propulsion.«instance».transmission.oilPressure
 * 5. Transmission oil temperature: propulsion.«instance».transmission.oilTemperature
 * 6. Transmission discrete status: notifications.propulsion.«instance».transmission.checkTransmission
 *                                  notifications.propulsion.«instance».transmission.overTemperature
 *                                  notifications.propulsion.«instance».transmission.lowOilPressure
 *                                  notifications.propulsion.«instance».transmission.lowOilLevel
 * 7. Reserved (byte alignment)
 */

const engine = require('../engine')

var translations = [
  {
    source: 'Transmission Gear',
    node: function (n2k) { return 'propulsion.' + engine.skEngineId(n2k) + '.transmission.gear' }
  },
  {
    node: function (n2k) { return 'propulsion.' + engine.skEngineId(n2k) + '.transmission.oilPressure' },
    value: function (n2k) {
      var hpa = Number(n2k.fields['Oil pressure'])
      return isNaN(hpa) ? null : hpa * 100.0
    }
  },
  {
    source: 'Oil temperature',
    node: function (n2k) { return 'propulsion.' + engine.skEngineId(n2k) + '.transmission.oilTemperature' }
  }
];

var statusNotifications = [
  {
    node: 'notifications.propulsion.%s.transmission.checkTransmission',
    message: 'Check %s Transmission',
    analyzerText: 'Check Transmission'
  },
  {
    node: 'notifications.propulsion.%s.transmission.overTemperature',
    message: '%s Transmission Over Temperature',
    analyzerText: 'Over Temperature'
  },
  {
    node: 'notifications.propulsion.%s.transmission.lowOilPressure',
    message: '%s Transmission Low Oil Pressure',
    analyzerText: 'Low Oil Pressure'
  },
  {
    node: 'notifications.propulsion.%s.transmission.lowOilLevel',
    message: '%s Transmission Low Oil Level',
    analyzerText: 'Low Oil Level'
  }
];

var notifications = engine.generateMappingsForStatus('Discrete Status 1', statusNotifications)

module.exports = translations.concat(notifications)
