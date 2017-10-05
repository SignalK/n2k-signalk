module.exports = [
  {
    node: 'electrical.ac.generator.power.real',
    value: function (n2k) {
      return n2k.fields['Real Power']
    },
  },
  {
    node: 'electrical.ac.generator.power.apparent',
    value: function (n2k) {
      return n2k.fields['Apparent Power']
    },
  },
]
