/* Transmission Parameters, Dynamic
 *
 * 1. Transmission instance:        port or starboard
 * 2. Transmission gear:            propulsion.«instance».transmission.gear
 * 3. Reserved (byte alignment)
 * 4. Transmission oil pressure:    propulsion.«instance».transmission.oilPressure
 * 5. Transmission oil temperature: propulsion.«instance».transmission.oilTemperature
 * 6. Transmission discrete status: not supported by schema
 * 7. Reserved (byte alignment)
 */

function skEngineId (n2k) {
  return n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port' ? 'port' : 'starboard'
}

module.exports = [
  {
    source: 'Transmission Gear',
    node: function (n2k) { return 'propulsion.' + skEngineId(n2k) + '.transmission.gear' }
  },
  {
    node: function (n2k) { return 'propulsion.' + skEngineId(n2k) + '.transmission.oilPressure' },
    value: function (n2k) {
      var hpa = Number(n2k.fields['Oil pressure'])
      return isNaN(hpa) ? null : hpa * 100.0
    }
  },
  {
    source: 'Oil temperature',
    node: function (n2k) { return 'propulsion.' + skEngineId(n2k) + '.transmission.oilTemperature' }
  }
];
