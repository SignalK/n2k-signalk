import { PGN_65285_LowranceTemperature } from '@canboat/ts-pgns'
import temperatureMappings from '../temperatureMappings.js'

type TemperatureMapping = { path?: string; pathWithIndex?: string }

// PGN_65285_LowranceTemperature has no temperatureInstance field, so it is
// read through a cast (#385).
const instanceOf = (n2k: PGN_65285_LowranceTemperature) =>
  (n2k.fields as { temperatureInstance?: unknown }).temperatureInstance

module.exports = [
  {
    source: 'actualTemperature',
    node: function (n2k: PGN_65285_LowranceTemperature) {
      const temperatureMapping: TemperatureMapping | undefined = (
        temperatureMappings as Record<string, TemperatureMapping>
      )[n2k.fields.temperatureSource as string]

      if (temperatureMapping) {
        if (temperatureMapping.pathWithIndex) {
          // Lowrance 65285 includes a Temperature Instance field, but
          // not every emitter populates it. Fall back to the literal
          // 'default' so downstream paths stay valid against the
          // Signal K schema (tanks.liveWell.<id>.temperature etc.).
          const instance =
            instanceOf(n2k) !== undefined ? instanceOf(n2k) : 'default'
          return temperatureMapping.pathWithIndex.replace(
            '<index>',
            String(instance)
          )
        } else if (temperatureMapping.path) {
          return temperatureMapping.path
        }
      }
    },
    instance: function (n2k: PGN_65285_LowranceTemperature) {
      return instanceOf(n2k) + ''
    },
    filter: function (n2k: PGN_65285_LowranceTemperature) {
      return n2k.fields.actualTemperature
    }
  }
]
