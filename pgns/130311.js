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

module.exports = [
  {
    node: function (n2k) {
      var temperatureMapping = temperatureMappings[n2k.fields.temperatureSource]
      if (temperatureMapping) {
        if (temperatureMapping.pathWithIndex) {
          return temperatureMapping.pathWithIndex.replace(
            '<index>',
            PGN_130311_INSTANCE
          )
        }
        if (temperatureMapping.path) {
          return temperatureMapping.path
        }
      }
    },
    filter: function (n2k) {
      return n2k.fields.temperatureSource !== undefined
    },
    source: 'temperature'
  },
  {
    node: function (n2k) {
      var humidityMapping = humidityMappings[n2k.fields.humiditySource]
      if (humidityMapping) {
        if (humidityMapping.pathWithIndex) {
          return humidityMapping.pathWithIndex.replace(
            '<index>',
            PGN_130311_INSTANCE
          )
        }
        if (humidityMapping.path) {
          return humidityMapping.path
        }
      }
      // Fallback for unknown source enum values.
      return n2k.fields.humiditySource === 'Inside'
        ? 'environment.inside.relativeHumidity'
        : 'environment.outside.humidity'
    },
    filter: function (n2k) {
      return typeof n2k.fields.humidity !== 'undefined'
    },
    value: function (n2k) {
      var ratio100 = Number(n2k.fields.humidity)
      return ratio100 / 100
    }
  },
  {
    node: 'environment.outside.pressure',
    filter: function (n2k) {
      return n2k.fields.atmosphericPressure
    },
    value: function (n2k) {
      return Number(n2k.fields.atmosphericPressure)
    }
  }
]
