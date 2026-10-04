const { skJ1939EngineId } = require('../utils.js')

// J1939 Inlet/Exhaust Conditions — intake manifold temperature
// (Kelvin from the SI decode).
module.exports = [
  {
    node: function (n2k) {
      return 'propulsion.' + skJ1939EngineId(n2k) + '.intakeManifoldTemperature'
    },
    source: 'intakeManifoldTemp',
    filter: function (n2k) {
      return typeof n2k.fields.intakeManifoldTemp !== 'undefined'
    }
  }
]
