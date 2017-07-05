
module.exports = [
  {
    source: 'Voltage',
    node: function(n2k) {
      return 'electrical.batteries.' + n2k.fields['Battery Instance'] + '.voltage'
    }
  },{
    source: 'Current',
    node: function(n2k) {
      return 'electrical.batteries.' + n2k.fields['Battery Instance'] + '.current'
    }
  },{
    source: 'Temperature',
    node: function(n2k) {
      return 'electrical.batteries.' + n2k.fields['Battery Instance'] + '.temperature'
    }
  }
]
