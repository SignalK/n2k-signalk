const schema = require('@signalk/signalk-schema')
const { lookupEnumerationValue } = require('@canboat/canboatjs')

module.exports = function (type) {
  const num = lookupEnumerationValue('SHIP_TYPE', type)
  var name
  if (typeof num !== 'undefined' && (name = schema.getAISShipTypeName(num))) {
    return {
      id: num,
      name: name
    }
  } else {
    return null
  }
}
