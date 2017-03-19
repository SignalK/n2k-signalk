const getMmsiContext = require('../mmsi-context')
const getFromStarboard = require('../aisFromStarboard')

module.exports = [
  {
    node: '',
    value: function(n2k) {
      return {
        name: n2k.fields.Name
      }
    }
  },
  {
    node: 'navigation.destination.commonName',
    source: 'Destination'
  },
  {
    node: 'design.draft',
    filter: function(n2k) {
      return n2k.fields['Draft']
    },
    value: function (n2k) {
      return { maximum: n2k.fields['Draft'] }
    }
  },
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
