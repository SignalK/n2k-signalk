
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
        return n2k.fields['Total Energy Export'] * 3.6e+6
      },
      filter: (n2k) => {
        return n2k.fields['Total Energy Export'] != null &&
          state.deviceInstance != null
      }
    },
    {
      node: function (n2k, state) {
        return `${prefix(n2k, state)}.energyImport`
      },
      value: (n2k) => {
        return n2k.fields['Total Energy Import'] * 3.6e+6
      },
      filter: (n2k) => {
        return n2k.fields['Total Energy Import'] != null &&
          state.deviceInstance != null
      }
    }
  ]
}
