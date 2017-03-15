const getMmsiContext = require('../mmsi-context')
const getFromStarboard = require('../aisFromStarboard')

module.exports = [
  {
    node: '',
    value: function(n2k) {
      return {
        name: n2k.fields.Name,
      }
    },
    filter: function(n2k) {
      return n2k.fields['Name'] 
    }      
  },
  {
    node: 'design.length.overall',
    source: 'Length',
    filter: function(n2k) {
      return n2k.fields['Length'] 
    }
  },
  {
    node: 'design.aisShipType',
    source: 'Type of ship',
    filter: function(n2k) {
      return n2k.fields['Type of ship'];
    }
  },
  {
    node: 'design.beam',
    source: 'Beam',
    filter: function(n2k) {
      return n2k.fields['Beam'];
    }
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
