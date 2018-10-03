const {chooseField} = require('../utils.js')

module.exports = [
  {
    node: 'environment.outside.pressure',
    filter: function (n2k) {
      return chooseField(n2k, 'Pressure Source', 'Source') == 'Atmospheric'
    },
    value: function (n2k) {
      return Number(n2k.fields['Pressure'])
    }
  }
]
