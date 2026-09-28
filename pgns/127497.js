const { instancePrefix } = require('../instanceGroups')

module.exports = [
  {
    node: function (n2k, state) {
      return instancePrefix(n2k, state) + '.trip.fuelUsed'
    },
    value: function (n2k) {
      return n2k.fields.tripFuelUsed / 1000
    },
    filter: function (n2k) {
      return typeof n2k.fields.tripFuelUsed !== 'undefined'
    }
  },
  {
    node: function (n2k, state) {
      return instancePrefix(n2k, state) + '.trip.fuelRate.average'
    },
    value: function (n2k) {
      return n2k.fields.fuelRateAverage / 1000
    },
    filter: function (n2k) {
      return typeof n2k.fields.fuelRateAverage !== 'undefined'
    }
  },
  {
    node: function (n2k, state) {
      return instancePrefix(n2k, state) + '.trip.fuelRate.economy'
    },
    value: function (n2k) {
      return n2k.fields.fuelRateEconomy / 1000
    },
    filter: function (n2k) {
      return typeof n2k.fields.fuelRateEconomy !== 'undefined'
    }
  },
  {
    node: function (n2k, state) {
      return instancePrefix(n2k, state) + '.trip.fuelRate.instantaneousEconomy'
    },
    value: function (n2k) {
      return n2k.fields.instantaneousFuelEconomy / 1000
    },
    filter: function (n2k) {
      return typeof n2k.fields.instantaneousFuelEconomy !== 'undefined'
    }
  }
]
