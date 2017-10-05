module.exports = [
  {
    node: 'electrical.ac.utility.power.real',
    value: function (n2k) {
      return n2k.fields['Real Power']
    },
  },
  {
    node: 'electrical.ac.utility.power.apparent',
    value: function (n2k) {
      return n2k.fields['Apparent Power']
    },
  },
]
