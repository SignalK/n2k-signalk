import { PGN_127507 } from '@canboat/ts-pgns'
import { seconds } from '../utils.js'

const charger = (path: string) => (n2k: PGN_127507) =>
  `electrical.chargers.${n2k.fields.instance}.${path}`

const text = (field: keyof PGN_127507['fields']) => ({
  value: (n2k: PGN_127507) => String(n2k.fields[field]).toLowerCase(),
  filter: (n2k: PGN_127507) => typeof n2k.fields[field] === 'string'
})

const onOff = (field: keyof PGN_127507['fields']) => ({
  value: (n2k: PGN_127507) => n2k.fields[field] === 'On',
  filter: (n2k: PGN_127507) => typeof n2k.fields[field] === 'string'
})

module.exports = [
  { node: charger('operatingState'), ...text('operatingState') },
  { node: charger('chargeMode'), ...text('chargeMode') },
  { node: charger('enabled'), ...onOff('enabled') },
  { node: charger('equalizationPending'), ...onOff('equalizationPending') },
  {
    allowNull: true,
    node: charger('equalizationTimeRemaining'),
    value: (n2k: PGN_127507) => seconds(n2k.fields.equalizationTimeRemaining)
  }
]
