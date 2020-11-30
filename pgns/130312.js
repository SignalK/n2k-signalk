const temperatureMappings = require('../temperatureMappings')
const { chooseField } = require('../utils.js')

module.exports = [
  {
    node: function (n2k) {
      var temperatureMapping =
        temperatureMappings[chooseField(n2k, 'Temperature Source', 'Source')]
      if (temperatureMapping) {
        if (temperatureMapping.pathWithIndex) {
          return temperatureMapping.pathWithIndex.replace(
            '<index>',
            n2k.fields['Instance']
          )
        } else if (temperatureMapping.path) {
          return temperatureMapping.path
        }
      } else {
        return `generic.temperatures.userDefined${n2k.fields['Source']}.${n2k.fields['Instance']}.temperature`
      }
    },
    instance: function (n2k) {
      return chooseField(n2k, 'Temperature Instance', 'Instance') + ''
    },
    source: 'Actual Temperature'
  }
]

module.exports.meta = (n2k) => {
  let res = []
  if ( !temperatureMappings[chooseField(n2k, 'Temperature Source', 'Source')] ) {
    res.push({
      path: `generic.temperatures.userDefined${n2k.fields['Source']}.${n2k.fields['Instance']}.temperature`,
      value: {
        units: 'K'
      }
    })
  }
  return res
}
