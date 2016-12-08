const getMmsiContext = require('../mmsi-context')

module.exports = [
  {
    node: '',
    value: function(n2k) {
      return {
        name: n2k.fields.Name
      }
    }
  }, {
    context: getMmsiContext
  }
]
