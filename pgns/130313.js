module.exports = [
  {
    node: function (n2k) {
      return (
        'environment.' +
        (n2k.fields.source === 'Inside'
          ? 'inside.relativeHumidity'
          : 'outside.humidity')
      )
    },
    filter: function (n2k) {
      return typeof n2k.fields.actualHumidity !== 'undefined'
    },
    value: function (n2k) {
      var ratio100 = Number(n2k.fields.actualHumidity)
      return ratio100 / 100
    }
  }
]
