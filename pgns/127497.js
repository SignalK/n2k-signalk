const { skEngineId } = require('../utils.js')

module.exports = [
  {
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.trip.fuelUsed'
    },
    value: function (n2k) {
      return n2k.fields['Trip Fuel Used'] / 1000
    },
    filter: function (n2k) {
      return typeof n2k.fields['Trip Fuel Used'] !== 'undefined'
    }
  },
  {
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.trip.fuelRate.average'
    },
    value: function (n2k) {
      return n2k.fields['Fuel Rate, Average'] / 1000
    },
    filter: function (n2k) {
      return typeof n2k.fields['Fuel Rate, Average'] !== 'undefined'
    }
  },
  {
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.trip.fuelRate.economy'
    },
    value: function (n2k) {
      return n2k.fields['Fuel Rate, Economy'] / 1000
    },
    filter: function (n2k) {
      return typeof n2k.fields['Fuel Rate, Economy'] !== 'undefined'
    }
  },
  {
    node: function (n2k) {
      return 'propulsion.' + skEngineId(n2k) + '.trip.fuelRate.instantaneousEconomy'
    },
    value: function (n2k) {
      return n2k.fields['Instantaneous Fuel Economy'] / 1000
    },
    filter: function (n2k) {
      return typeof n2k.fields['Instantaneous Fuel Economy'] !== 'undefined'
    }
  },
]
