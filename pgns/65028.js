module.exports = [
  {
    node: 'electrical.ac.generator.reactivePower',
    value: function (n2k) {
      return n2k.fields['Reactive Power']
    },
  },
  {
    node: 'electrical.ac.generator.powerFactor',
    value: function (n2k) {
      return n2k.fields['Power Factor']
    },
  },
  {
    node: 'electrical.ac.generator.powerFactorLagging',
    value: function (n2k) {
      const enums = ['leading', 'lagging', 'error']
      return enums[parseInt(n2k.fields['Power Factor Lagging'], 10)]
    },
  },
]
