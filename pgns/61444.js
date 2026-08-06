const { skJ1939EngineId } = require('../utils.js')

// J1939 EEC1 (ECU #1) — engine speed. Arrives from canboat's J1939
// schema flavor (the j1939-wasm connection type), fields in rpm.
module.exports = [
  {
    node: function (n2k) {
      return 'propulsion.' + skJ1939EngineId(n2k) + '.revolutions'
    },
    value: function (n2k) {
      return Number(n2k.fields.engineRpm) / 60.0
    },
    filter: function (n2k) {
      return typeof n2k.fields.engineRpm !== 'undefined'
    }
  }
]
