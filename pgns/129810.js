const getMmsiContext = require('../mmsi-context')
const getFromStarboard = require('../aisFromStarboard')

module.exports = [
  {
    node: 'design.length',
    value: function(n2k) {
      return { overall: Number(n2k.fields.Length) }
    },
    filter: function(n2k) {
      return n2k.fields['Length'];
    }
  },
  {
    node: 'design.aisShipType',
    source: 'Type of ship'
  },
  {
    node: 'design.beam',
    source: 'Beam'
  },
  {
    node: 'sensors.ais.fromBow',
    source: 'Position reference from Bow'
  },
  {
    node: 'sensors.ais.fromCenter',
    value: getFromStarboard,
    filter: function(n2k) {
      return n2k.fields['Position reference from Starboard'] && n2k.fields['Beam'];
    }
  },
  {
    context: getMmsiContext
  }
]
