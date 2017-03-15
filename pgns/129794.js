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
    node: 'sensors.ais.fromBow',
    source: 'Position reference from Bow'
  },
  {
    node: 'sensors.ais.fromCenter',
    value: getFromStarboard
  },
  {
    context: getMmsiContext
  }
]
