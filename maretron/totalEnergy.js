
module.exports = (type) => {
  function prefix(n2k) {
    return `electrical.${type}.0.total`
  }
  return [
    {
      node: function (n2k) {
        return `${prefix(n2k)}.energyExport`
      },
      value: (n2k) => {
        return n2k.fields['Total Energy Export'] * 3.6e+6
      },
      filter: (n2k) => {
        return n2k.fields['Total Energy Export'] != null
      }
    },
    {
      node: function (n2k) {
        return `${prefix(n2k)}.energyImport`
      },
      value: (n2k) => {
        return n2k.fields['Total Energy Import'] * 3.6e+6
      },
      filter: (n2k) => {
        return n2k.fields['Total Energy Import'] != null
      }
    }
  ]
}
