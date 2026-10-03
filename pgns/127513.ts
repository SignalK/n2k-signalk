import { PGN_127513 } from '@canboat/ts-pgns'

const battery = (path: string) => (n2k: PGN_127513) =>
  `electrical.batteries.${n2k.fields.instance}.${path}`

const lower = (field: keyof PGN_127513['fields']) => ({
  value: (n2k: PGN_127513) => String(n2k.fields[field]).toLowerCase(),
  filter: (n2k: PGN_127513) => typeof n2k.fields[field] === 'string'
})

module.exports = [
  { node: battery('batteryType'), ...lower('batteryType') },
  {
    node: battery('supportsEqualization'),
    value: (n2k: PGN_127513) => n2k.fields.supportsEqualization === 'Yes',
    filter: (n2k: PGN_127513) =>
      typeof n2k.fields.supportsEqualization === 'string'
  },
  {
    node: battery('nominalVoltage'),
    value: (n2k: PGN_127513) => n2k.fields.nominalVoltage,
    filter: (n2k: PGN_127513) => typeof n2k.fields.nominalVoltage === 'string'
  },
  { node: battery('chemistry'), ...lower('chemistry') },
  // canboatjs gives the capacity in coulomb (C), as Signal K wants it.
  { source: 'capacity', node: battery('capacity.nominal') },
  { source: 'temperatureCoefficient', node: battery('temperatureCoefficient') },
  { source: 'peukertExponent', node: battery('peukertExponent') },
  { source: 'chargeEfficiencyFactor', node: battery('chargeEfficiencyFactor') }
]
