import { PGN_129291 } from '@canboat/ts-pgns'
import { isNumber } from '../utils.js'

module.exports = [
  {
    node: 'environment.current',
    filter: function (n2k: PGN_129291) {
      return isNumber(n2k.fields.set) && isNumber(n2k.fields.drift)
    },
    value: function (n2k: PGN_129291) {
      if ((n2k.fields.setReference as unknown) === 'True') {
        return {
          setTrue: Number(n2k.fields.set),
          drift: Number(n2k.fields.drift)
        }
      } else if ((n2k.fields.setReference as unknown) === 'Magnetic') {
        return {
          setMagnetic: Number(n2k.fields.set),
          drift: Number(n2k.fields.drift)
        }
      }
    }
  }
]
