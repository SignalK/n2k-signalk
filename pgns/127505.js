module.exports = [
  {
    node: function (n2k) {
      return (
        'tanks.' +
        tankMappings[n2k.fields.type] +
        '.' +
        n2k.fields.instance +
        '.currentLevel'
      )
    },
    value: function (n2k) {
      var ratio100 = Number(n2k.fields.level)
      return ratio100 / 100
    }
  },
  {
    node: function (n2k) {
      return (
        'tanks.' +
        tankMappings[n2k.fields.type] +
        '.' +
        n2k.fields.instance +
        '.capacity'
      )
    },
    value: function (n2k) {
      var value = Number(n2k.fields.capacity)
      return value / 1000
    },
    filter: n2k => {
      return typeof n2k.fields.capacity !== 'undefined'
    }
  }
]

var tankMappings = {
  Fuel: 'fuel',
  Water: 'freshWater',
  'Gray water': 'wasteWater',
  'Live well': 'liveWell',
  Oil: 'lubrication',
  'Black water': 'blackWater'
}
