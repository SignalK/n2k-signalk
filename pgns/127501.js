module.exports = []

for (var i = 1; i <= 28; i++) {
  const idx = i
  const field = 'Indicator' + idx
  var mapping = {
    node: function (n2k) {
      return (
        'electrical.switch.' +
        n2k.fields['Indicator Bank Instance'] +
        '.' +
        idx +
        '.state'
      )
    },
    filter: function (n2k) {
      return typeof n2k.fields[field] !== 'undefined'
    },
    value: function (n2k) {
      return n2k.fields[field] == 'On'
    }
  }

  var orderMapping = {
    node: function (n2k) {
      return (
        'electrical.switch.' +
        n2k.fields['Indicator Bank Instance'] +
        '.' +
        idx +
        '.order'
      )
    },
    filter: function (n2k) {
      return typeof n2k.fields[field] !== 'undefined'
    },
    value: function (n2k) {
      return idx
    }
  }  
  module.exports.push(mapping)
  module.exports.push(orderMapping)
}
