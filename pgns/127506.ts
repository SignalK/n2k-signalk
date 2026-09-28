import { PGN_127506 } from '@canboat/ts-pgns'
import { seconds } from '../utils.js'
const { instancePrefix } = require('../instanceGroups')

const battery = (path: string) => (n2k: PGN_127506, state: any) =>
  `${instancePrefix(n2k, state)}.capacity.${path}`

// canboatjs gives the state of charge and of health as ratios.
module.exports = [
  { source: 'stateOfCharge', node: battery('stateOfCharge') },
  { source: 'stateOfHealth', node: battery('stateOfHealth') },
  {
    allowNull: true,
    node: battery('timeRemaining'),
    value: (n2k: PGN_127506) => seconds(n2k.fields.timeRemaining)
  }
]
