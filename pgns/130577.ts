import { PGN_130577 } from '@canboat/ts-pgns'
import { isNumber } from '../utils.js'

module.exports = [
  {
    source: 'cog',
    node: 'navigation.courseOverGroundTrue',
    filter: function (n2k: PGN_130577) {
      return (n2k.fields.cogReference as unknown) === 'True'
    }
  },
  {
    source: 'sog',
    node: 'navigation.speedOverGround',
    filter: function (n2k: PGN_130577) {
      return isNumber(n2k.fields.sog)
    }
  },
  {
    node: 'environment.current',
    filter: function (n2k: PGN_130577) {
      return isNumber(n2k.fields.drift) && isNumber(n2k.fields.set)
    },
    value: function (n2k: PGN_130577) {
      if ((n2k.fields.cogReference as unknown) === 'True') {
        return {
          setTrue: Number(n2k.fields.set),
          drift: Number(n2k.fields.drift)
        }
      } else if ((n2k.fields.cogReference as unknown) === 'Magnetic') {
        // 130577 has no set reference of its own; cogReference applies to
        // every direction in it.
        return {
          setMagnetic: Number(n2k.fields.set),
          drift: Number(n2k.fields.drift)
        }
      }
    }
  }
]
