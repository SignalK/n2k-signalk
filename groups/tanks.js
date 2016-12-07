
exports.mappings = {
  // Fluid Level
  '127505': [{
    node: function(n2k) {
      return 'tanks.' + tankMappings[n2k.fields['Type']] + '.' + n2k.fields['Instance'] + '.currentLevel'
    },
    source: 'Level'
  }, {
    node: function(n2k) {
      return 'tanks.' + tankMappings[n2k.fields['Type']] + '.' + n2k.fields['Instance'] + '.capacity'
    },
    source: 'Capacity'
  }]
}

var tankMappings = {
  "Fuel": "fuel",
  "Water": "freshWater",
  "Gray water": "wasteWater",
  "Live well": "liveWell",
  "Oil": "lubrication",
  "Black water": "blackWater"
}
