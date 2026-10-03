import { PGN_127506 } from '@canboat/ts-pgns'
import { seconds } from '../utils.js'

const battery = (path: string) => (n2k: PGN_127506) =>
  `electrical.batteries.${n2k.fields.instance}.capacity.${path}`

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
