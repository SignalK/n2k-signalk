import { skJ1939EngineId } from '../utils.js'

// ts-pgns has no J1939 PGNs; the fields this mapping reads.
type J1939InletExhaust = {
  src: number
  fields: { intakeManifoldTemp?: number }
}

// J1939 Inlet/Exhaust Conditions — intake manifold temperature
// (Kelvin from the SI decode).
module.exports = [
  {
    node: function (n2k: J1939InletExhaust) {
      return 'propulsion.' + skJ1939EngineId(n2k) + '.intakeManifoldTemperature'
    },
    source: 'intakeManifoldTemp',
    filter: function (n2k: J1939InletExhaust) {
      return Number.isFinite(n2k.fields.intakeManifoldTemp)
    }
  }
]
