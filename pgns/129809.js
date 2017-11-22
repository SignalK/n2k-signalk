const getMmsiContext = require('../mmsi-context')

module.exports = [
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
        mmsi: n2k.fields["User ID"].toString()
      }
    }
  },
  {
    context: getMmsiContext
  }
]
