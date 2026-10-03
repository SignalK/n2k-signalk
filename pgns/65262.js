const { skJ1939EngineId } = require('../utils.js')

// J1939 Engine Temp #1 — coolant temperature (Kelvin from the SI
// decode).
module.exports = [
  {
    node: function (n2k) {
      return 'propulsion.' + skJ1939EngineId(n2k) + '.coolantTemperature'
    },
    source: 'engineCoolantTemp',
    filter: function (n2k) {
      return typeof n2k.fields.engineCoolantTemp !== 'undefined'
    }
  }
]
