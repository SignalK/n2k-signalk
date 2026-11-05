import { PGN_65285_LowranceTemperature } from '@canboat/ts-pgns'
import temperatureMappings from '../temperatureMappings.js'

type TemperatureMapping = { path?: string; pathWithIndex?: string }

// 65285 has no instance: canboat defines none, and the bytes after the
// temperature are unset (0xff) in every capture in canboat's
// samples/lowrance-65285.raw. A source that takes an index (a live well, a
// bait well) is written as 'default', so the path stays valid against the
// Signal K schema, and no source.instance is written.
const INDEX = 'default'

module.exports = [
  {
    source: 'actualTemperature',
    node: function (n2k: PGN_65285_LowranceTemperature) {
      const temperatureMapping: TemperatureMapping | undefined = (
        temperatureMappings as Record<string, TemperatureMapping>
      )[n2k.fields.temperatureSource as string]

      if (temperatureMapping) {
        if (temperatureMapping.pathWithIndex) {
          return temperatureMapping.pathWithIndex.replace('<index>', INDEX)
        } else if (temperatureMapping.path) {
          return temperatureMapping.path
        }
      }
    },
    // A reading of 0 is a reading
    filter: function (n2k: PGN_65285_LowranceTemperature) {
      return (
        n2k.fields.actualTemperature !== undefined &&
        n2k.fields.actualTemperature !== null
      )
    }
  }
]
