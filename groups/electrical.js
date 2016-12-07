

exports.mappings = {
  //Battery Voltage
  '127508': [{
    source: 'Voltage',
    node: function(n2k) {
      return 'electrical.batteries.' + n2k.fields['Battery Instance'] + '.voltage'
    },
  }]
}

