import { skJ1939EngineId } from '../utils.js'

// ts-pgns has no J1939 PGNs; the fields this mapping reads.
type J1939EngineTemp1 = { src: number; fields: { engineCoolantTemp?: number } }

// J1939 Engine Temp #1 — coolant temperature (Kelvin from the SI
// decode).
module.exports = [
  {
    node: function (n2k: J1939EngineTemp1) {
      return 'propulsion.' + skJ1939EngineId(n2k) + '.coolantTemperature'
    },
    source: 'engineCoolantTemp',
    filter: function (n2k: J1939EngineTemp1) {
      return Number.isFinite(n2k.fields.engineCoolantTemp)
    }
  }
]
