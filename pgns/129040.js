const getMmsiContext = require('../mmsi-context')

module.exports = [
  {
    node: '',
    value: function(n2k) {
      return {
        name: n2k.fields.Name,
      }
    }
  },
  {
    source: 'Destination',
    node: 'navigation.destination.name'
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
    source: 'SOG',
    node: 'navigation.speedOverGround'
  },
  {
    source: 'COG',
    node: 'navigation.courseOverGroundTrue'
  },
  {
    source: 'True Heading',
    node: 'navigation.headingTrue'
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
