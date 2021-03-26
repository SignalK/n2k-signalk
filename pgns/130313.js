module.exports = [
  {
    node: function (n2k) {
      return (
        'environment.' +
        (n2k.fields['Source'] === 'Inside' ? 'inside' : 'outside') +
        '.humidity'
      )
    },
    filter: function (n2k) {
      return typeof n2k.fields['Actual Humidity'] !== 'undefined'
    },
    value: function (n2k) {
      var ratio100 = Number(n2k.fields['Actual Humidity'])
      return ratio100 / 100
    }
  }
]

