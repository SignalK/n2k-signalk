const { skEngineId } = require('../utils.js')

module.exports = [
  {
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.trip.fuelUsed'
    },
    value: function (n2k) {
      return n2k.fields.tripFuelUsed / 1000
    },
    filter: function (n2k) {
      return typeof n2k.fields.tripFuelUsed !== 'undefined'
    }
  },
  {
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.trip.fuelRate.average'
    },
    value: function (n2k) {
      return n2k.fields.fuelRateAverage / 1000
    },
    filter: function (n2k) {
      return typeof n2k.fields.fuelRateAverage !== 'undefined'
    }
  },
  {
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.trip.fuelRate.economy'
    },
    value: function (n2k) {
      return n2k.fields.fuelRateEconomy / 1000
    },
    filter: function (n2k) {
      return typeof n2k.fields.fuelRateEconomy !== 'undefined'
    }
  },
  {
    node: function (n2k) {
      return (
        'propulsion.' + skEngineId(n2k) + '.trip.fuelRate.instantaneousEconomy'
      )
    },
    value: function (n2k) {
      return n2k.fields.instantaneousFuelEconomy / 1000
    },
    filter: function (n2k) {
      return typeof n2k.fields.instantaneousFuelEconomy !== 'undefined'
    }
  }
]
