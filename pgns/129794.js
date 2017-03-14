const getMmsiContext = require('../mmsi-context')

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
    node: 'navigation.destination.name',
    source: 'Destination'
  },
  {
    node: 'design.draft.maximum',
    source: 'Draft'
  },
  {
    node: 'design.length.overall',
    source: 'Length'
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
    context: getMmsiContext
  }
]
