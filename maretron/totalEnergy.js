
module.exports = (type) => {
  function prefix(n2k, state) {
    return `electrical.${type}.${state.deviceInstance || 0}.total`
  }
  return [
    {
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.energyExport`
      },
      value: (n2k) => {
        return n2k.fields.totalEnergyExport
      },
      filter: (n2k, state) => {
        return n2k.fields.totalEnergyExport != null &&
          state.deviceInstance != null
      }
    },
    {
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.energyImport`
      },
      value: (n2k) => {
        return n2k.fields.totalEnergyImport
      },
      filter: (n2k, state) => {
        return n2k.fields.totalEnergyImport != null &&
          state.deviceInstance != null
      }
    }
  ]
}
