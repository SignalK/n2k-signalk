type State = { deviceInstance?: number }
type ReactivePower = { fields: { powerFactorLagging?: string } }

// canboatjs scales powerFactor to cos phi, so it passes through as decoded.
module.exports = (type: string, phase: string) => {
  const prefix = (state: State) =>
    `electrical.${type}.${state.deviceInstance || 0}.${phase}`
  const hasInstance = (n2k: unknown, state: State) =>
    state.deviceInstance != null

  return [
    {
      source: 'reactivePower',
      node: (n2k: unknown, state: State) => `${prefix(state)}.reactivePower`,
      filter: hasInstance
    },
    {
      source: 'powerFactor',
      node: (n2k: unknown, state: State) => `${prefix(state)}.powerFactor`,
      filter: hasInstance
    },
    {
      node: (n2k: unknown, state: State) =>
        `${prefix(state)}.powerFactorLagging`,
      value: (n2k: ReactivePower) =>
        String(n2k.fields.powerFactorLagging).toLowerCase(),
      filter: (n2k: ReactivePower, state: State) =>
        n2k.fields.powerFactorLagging != null && state.deviceInstance != null
    }
  ]
}
