const getMmsiContext = require('../mmsi-context')

module.exports = [
  {
    node: 'sensors.ais.class',
    value: function (n2k) {
      return 'B'
    }
  },
  {
    node: '',
    value: function (n2k) {
      return {
        name: n2k.fields.Name
      }
    }
  },
  {
    node: '',
    value: function (n2k) {
      return {
        mmsi: n2k.fields['User ID'].toString()
      }
    }
  },
  {
    context: getMmsiContext
  }
]
