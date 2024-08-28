const getMmsiContext = require('../mmsi-context').getMmsiContext
const getFromStarboard = require('../aisFromStarboard')
const getShipType = require('../aisShipTypeMapping')

module.exports = [
  {
    node: '',
    value: function (n2k) {
      return {
        name: n2k.fields.Name
      }
    },
    filter: function (n2k) {
      return n2k.fields['Name']
    }
  },
  {
    node: 'design.length',
    value: function (n2k) {
      return { overall: Number(n2k.fields.Length) }
    },
    filter: function (n2k) {
      return n2k.fields['Length']
    }
  },
  {
    node: 'design.aisShipType',
    value: function (n2k) {
      return getShipType(n2k.fields['Type of ship'])
    },
    filter: function (n2k) {
      return n2k.fields['Type of ship']
    }
  },
  {
    node: 'design.beam',
    source: 'Beam',
    filter: function (n2k) {
      return n2k.fields['Beam']
    }
  },
  {
    node: 'sensors.ais.fromBow',
    source: 'Position reference from Bow'
  },
  {
    node: 'sensors.ais.fromCenter',
    value: getFromStarboard,
    filter: function (n2k) {
      return (
        n2k.fields['Position reference from Starboard'] && n2k.fields['Beam']
      )
    }
  },
  {
    node: '',
    filter: n2k => n2k.fields['User ID'],
    value: function (n2k) {
      return {
        mmsi: n2k.fields['User ID'].toString()
      }
    }
  },
  {
    context: getMmsiContext
  }
]
