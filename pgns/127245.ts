import { PGN_127245 } from '@canboat/pgns'

module.exports = [
  {
    source: 'position',
    node: 'steering.rudderAngle',
    filter: function (n2k:PGN_127245) {
      return typeof n2k.fields.position !== 'undefined'
    }
  }
]
