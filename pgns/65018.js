module.exports = [
  {
    node: 'electrical.ac.generator.energyExport',
    value: function (n2k) {
      return Number(n2k.fields['Total Energy Export'] || 0) * 3600000
    },
  },
  {
    node: 'electrical.ac.generator.energyImport',
    value: function (n2k) {
      return Number(n2k.fields['Total Energy Import'] || 0) * 3600000
    },
  },
]
