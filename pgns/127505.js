module.exports = [
  {
    node: function (n2k) {
      return (
        'tanks.' +
        tankMappings[n2k.fields['Type']] +
        '.' +
        n2k.fields['Instance'] +
        '.currentLevel'
      )
    },
    value: function (n2k) {
      var ratio100 = Number(n2k.fields['Level'])
      return ratio100 / 100
    }
  },
  {
    node: function (n2k) {
      return (
        'tanks.' +
        tankMappings[n2k.fields['Type']] +
        '.' +
        n2k.fields['Instance'] +
        '.capacity'
      )
    },
    value: function (n2k) {
      var value = Number(n2k.fields['Capacity'])
      return value / 1000
    },
    filter: (n2k) => {
      return typeof n2k.fields['Capacity'] !== 'undefined'
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
