import { getEnumerationValue } from '@canboat/ts-pgns'
// signalk-schema ships no type declarations.
const schema = require('@signalk/signalk-schema')

export = function (type: unknown) {
  // The callers pass the decoded typeOfShip, normally its SHIP_TYPE name.
  const num = getEnumerationValue('SHIP_TYPE', type as string)
  let name
  if (typeof num !== 'undefined' && (name = schema.getAISShipTypeName(num))) {
    return {
      id: num,
      name: name
    }
  } else {
    return null
  }
}
