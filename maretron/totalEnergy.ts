type State = { deviceInstance?: number }
// 65005 and 65018 carry these fields.
type TotalEnergy = {
  fields: { totalEnergyExport?: number; totalEnergyImport?: number }
}

module.exports = (type: string) => {
  function prefix (n2k: TotalEnergy, state: State) {
    return `electrical.${type}.${state.deviceInstance || 0}.total`
  }
  return [
    {
      node: function (n2k: TotalEnergy, state: State) {
        return `${prefix(n2k, state)}.energyExport`
      },
      value: (n2k: TotalEnergy) => {
        return n2k.fields.totalEnergyExport
      },
      filter: (n2k: TotalEnergy, state: State) => {
        return (
          n2k.fields.totalEnergyExport != null && state.deviceInstance != null
        )
      }
    },
    {
      node: function (n2k: TotalEnergy, state: State) {
        return `${prefix(n2k, state)}.energyImport`
      },
      value: (n2k: TotalEnergy) => {
        return n2k.fields.totalEnergyImport
      },
      filter: (n2k: TotalEnergy, state: State) => {
        return (
          n2k.fields.totalEnergyImport != null && state.deviceInstance != null
        )
      }
    }
  ]
}
