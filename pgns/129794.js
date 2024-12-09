const getMmsiContext = require('../mmsi-context').getMmsiContext
const getFromStarboard = require('../aisFromStarboard')
const getShipType = require('../aisShipTypeMapping')

module.exports = [
  {
    node: 'sensors.ais.class',
    value: function (n2k) {
      return 'A'
    }
  },
  {
    node: '',
    filter: n2k => n2k.fields.Name,
    value: function (n2k) {
      return {
        name: n2k.fields.Name
      }
    }
  },
  {
    node: 'navigation.destination.commonName',
    value: n2k => n2k.fields['Destination']
  },
  {
    node: 'design.draft',
    filter: function (n2k) {
      return n2k.fields['Draft']
    },
    value: function (n2k) {
      return { maximum: n2k.fields['Draft'] }
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
    node: '',
    filter: n2k => n2k.fields['Callsign'],
    value: n2k => ({
      communication: {
        callsignVhf: n2k.fields['Callsign']
      }
    })
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
    node: '',
    value: function (n2k) {
      return {
        registrations: {
          imo: `IMO ${n2k.fields['IMO number']}`
        }
      }
    },
    filter: function (n2k) {
      return n2k.fields['IMO number'] && n2k.fields['IMO number'] != 0
    }
  },
  {
    context: getMmsiContext
  }
]
