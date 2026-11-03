import { PGN_130310 } from '@canboat/ts-pgns'

module.exports = [
  {
    source: 'outsideAmbientAirTemperature',
    node: 'environment.outside.temperature',
    filter: function (n2k: PGN_130310) {
      return n2k.fields.outsideAmbientAirTemperature
    }
  },
  {
    node: 'environment.outside.pressure',
    filter: function (n2k: PGN_130310) {
      return n2k.fields.atmosphericPressure
    },
    value: function (n2k: PGN_130310) {
      return Number(n2k.fields.atmosphericPressure)
    }
  },
  {
    node: 'environment.water.temperature',
    filter: function (n2k: PGN_130310) {
      return n2k.fields.waterTemperature
    },
    value: function (n2k: PGN_130310) {
      return Number(n2k.fields.waterTemperature)
    }
  }
]
