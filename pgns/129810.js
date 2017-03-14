const getMmsiContext = require('../mmsi-context')

module.exports = [
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
