import { getEnumerationValue } from '@canboat/ts-pgns'
import { getAISShipTypeName } from '@signalk/path-metadata'

export = function (type: unknown) {
  // The callers pass the decoded typeOfShip, normally its SHIP_TYPE name.
  const num = getEnumerationValue('SHIP_TYPE', type as string)
  let name
  if (typeof num !== 'undefined' && (name = getAISShipTypeName(num))) {
    return {
      id: num,
      name: name
    }
  } else {
    return null
  }
}
