const schema = require('@signalk/signalk-schema')
const { getEnumerationValue } = require('@canboat/ts-pgns')

module.exports = function (type) {
  const num = getEnumerationValue('SHIP_TYPE', type)
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
