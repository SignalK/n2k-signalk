import { PGN_129291 } from '@canboat/ts-pgns'

module.exports = [
  {
    node: 'environment.current',
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
