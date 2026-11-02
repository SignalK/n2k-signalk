import { PGN_129026 } from '@canboat/ts-pgns'

module.exports = [
  {
    source: 'sog',
    node: 'navigation.speedOverGround'
  },
  {
    source: 'cog',
    node: 'navigation.courseOverGroundTrue',
    filter: function (n2k: PGN_129026) {
      return (n2k.fields.cogReference as unknown) === 'True'
    }
  },
  {
    source: 'cog',
    node: 'navigation.courseOverGroundMagnetic',
    filter: function (n2k: PGN_129026) {
      return (n2k.fields.cogReference as unknown) === 'Magnetic'
    }
  }
]
