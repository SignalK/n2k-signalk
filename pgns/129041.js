const getMmsiContext = require('../mmsi-context')
const getFromStarboard = require('../aisFromStarboard')

module.exports = [
  {
    node: '',
    value: function(n2k) {
      return {
        name: n2k.fields['AtoN Name']
      }
    }
  },
  {
    value: function(n2k) {
      return {
        longitude: Number(n2k.fields.Longitude),
        latitude: Number(n2k.fields.Latitude)
      }
    },
    node: 'navigation.position'
  },
  {
    node: 'design.length',
    value: function(n2k) {
      return { overall: Number(n2k.fields['Length/Diameter']) }
    },
    filter: function(n2k) {
      return n2k.fields['Length/Diameter'];
    }
  },
  {
    node: 'design.atonType',
    source: 'AtoN Type'
  },
  {
    node: 'design.beam',
    source: 'Beam/Diameter'
  },
  {
    node: 'sensors.ais.fromBow',
    source: 'Position reference from Bow'
  },
  {
    node: 'sensors.ais.fromCenter',
    value: getFromStarboard,
    filter: function(n2k) {
      return n2k.fields['Position reference from Starboard'] && n2k.fields['Beam/Diameter'];
    }
  },
  {
    context: function(n2k) { return 'atons.urn:mrn:imo:mmsi:' + n2k.fields['User ID'] }
  }
]
