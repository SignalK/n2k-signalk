const temperatureMappings = require('../temperatureMappings') 

module.exports = [
  {
    source: 'Actual Temperature',
    node: 'environment.inside.engineRoom.temperature',
    instance: function (n2k) {
      return n2k.fields['Temperature Instance'] + ''
    },
    filter: function (n2k) {
      return n2k.fields['Actual Temperature']
    }
  }
]
