type State = { deviceInstance?: number }

// The device reports real power in W and apparent power in VA, already in SI.
module.exports = function (type: string, phase: string) {
  const prefix = (state: State) =>
    `electrical.${type}.${state.deviceInstance || 0}.${phase}`
  const hasInstance = (n2k: unknown, state: State) =>
    state.deviceInstance != null

  return [
    {
      source: 'realPower',
      node: (n2k: unknown, state: State) => `${prefix(state)}.realPower`,
      filter: hasInstance
    },
    {
      source: 'apparentPower',
      node: (n2k: unknown, state: State) => `${prefix(state)}.apparentPower`,
      filter: hasInstance
    }
  ]
}
