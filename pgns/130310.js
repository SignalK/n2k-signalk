module.exports = [
  {
    source: 'outsideAmbientAirTemperature',
    node: 'environment.outside.temperature',
    filter: function (n2k) {
      return n2k.fields.outsideAmbientAirTemperature
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
  },
  {
    node: 'environment.water.temperature',
    filter: function (n2k) {
      return n2k.fields.waterTemperature
    },
    value: function (n2k) {
      return Number(n2k.fields.waterTemperature)
    }
  }
]
