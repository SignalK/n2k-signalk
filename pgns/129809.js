const getMmsiContext = require('../mmsi-context').getMmsiContext

module.exports = [
  {
    node: 'sensors.ais.class',
    filter: n2k => n2k.fields.userId,
    value: function (n2k) {
      return 'B'
    }
  },
  {
    node: '',
    filter: n2k => n2k.fields.name,
    value: function (n2k) {
      return {
        name: n2k.fields.name
      }
    }
  },
  {
    node: '',
    filter: n2k => n2k.fields.userId,
    value: function (n2k) {
      return {
        mmsi: n2k.fields.userId.toString()
      }
    }
  },
  {
    context: getMmsiContext,
    filter: n2k => n2k.fields.userId
  }
]
