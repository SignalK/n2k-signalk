var extend = require('util')._extend


function getMmsiContext(n2k) {
  return 'vessels.urn:mrn:imo:mmsi:' + n2k.fields['User ID'];
}

mappings = {
  '129809': [{
    node: '',
    value: function(n2k) {
      return {
        name: n2k.fields.Name
      }
    }
  }, {
    context: getMmsiContext
  }],
  '129794': [{
    node: '',
    value: function(n2k) {
      return {
        name: n2k.fields.Name
      }
    }
  }, {
    context: getMmsiContext
  }]
}

extend(mappings, require('./groups/environment').mappings)
extend(mappings, require('./groups/navigation').mappings)
extend(mappings, require('./groups/steering').mappings)
extend(mappings, require('./groups/propulsion').mappings)
extend(mappings, require('./groups/tanks').mappings)
extend(mappings, require('./groups/electrical').mappings)
extend(mappings, require('./groups/raymarine').mappings)

exports.mappings = mappings

