const getMmsiContext = require('../mmsi-context')

module.exports = [
  {
    node: 'sensors.ais.class',
    filter: n2k => n2k.fields['User ID'],
    value: function (n2k) {
      return 'B'
    }
  },
  {
    node: '',
    filter: n2k => n2k.fields.Name,
    value: function (n2k) {
      return {
        name: n2k.fields.Name
      }
    }
  },
  {
    node: '',
    filter: n2k => n2k.fields['User ID'],
    value: function (n2k) {
      return {
        mmsi: n2k.fields['User ID'].toString()
      }
    }
  },
  {
    context: getMmsiContext,
    filter: n2k => n2k.fields['User ID']
  }
]
