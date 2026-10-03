import { PGN_130311 } from '@canboat/ts-pgns'

const temperatureMappings = require('../temperatureMappings')
const humidityMappings = require('../humidityMappings')

// PGN 130311 (Environmental Parameters) carries one temperature, one
// humidity and one pressure reading from the device — there is no
// Instance field. Substitute the literal 'default' for the <index>
// placeholder so the path slots into the indexed schema position
// (e.g. environment.inside.default.temperature). Multiple devices
// publishing the same Source enum collide on this 'default' segment;
// resolving that requires distinguishing by $source which the
// priority engine handles.
const PGN_130311_INSTANCE = 'default'

type Mapping = { path?: string; pathWithIndex?: string }

function path(mapping: Mapping | undefined): string | undefined {
  if (mapping?.pathWithIndex) {
    return mapping.pathWithIndex.replace('<index>', PGN_130311_INSTANCE)
  }
  return mapping?.path
}

module.exports = [
  {
    node: (n2k: PGN_130311) =>
      path(temperatureMappings[n2k.fields.temperatureSource as string]),
    filter: (n2k: PGN_130311) => n2k.fields.temperatureSource !== undefined,
    source: 'temperature'
  },
  {
    node: (n2k: PGN_130311) =>
      path(humidityMappings[n2k.fields.humiditySource as string]) ??
      ((n2k.fields.humiditySource as unknown) === 'Inside'
        ? 'environment.inside.relativeHumidity'
        : 'environment.outside.humidity'),
    // canboatjs gives the humidity as a ratio.
    source: 'humidity'
  },
  {
    node: 'environment.outside.pressure',
    filter: (n2k: PGN_130311) => Boolean(n2k.fields.atmosphericPressure),
    source: 'atmosphericPressure'
  }
]
