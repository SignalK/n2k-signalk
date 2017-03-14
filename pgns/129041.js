const getMmsiContext = require('../mmsi-context')

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
    node: 'design.length.overall',
    source: 'Length/Diameter'
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
    context: function(n2k) { return 'atons.urn:mrn:imo:mmsi:' + n2k.fields['User ID'] }
  }
]
