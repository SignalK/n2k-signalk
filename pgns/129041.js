const getMmsiContext = require('../mmsi-context').getMmsiContext
const getFromStarboard = require('../aisFromStarboard')
const schema = require('@signalk/signalk-schema')

module.exports = [
  {
    node: '',
    filter: n2k => n2k.fields['AtoN Name'],
    value: function (n2k) {
      return {
        name: n2k.fields['AtoN Name']
      }
    }
  },
  {
    filter: (n2k) => n2k.fields.Longitude && n2k.fields.Latitude,
    value: function (n2k) {
      return {
        longitude: Number(n2k.fields.Longitude),
        latitude: Number(n2k.fields.Latitude)
      }
    },
    node: 'navigation.position'
  },
  {
    node: 'design.length',
    value: function (n2k) {
      return { overall: Number(n2k.fields['Length/Diameter']) }
    },
    filter: function (n2k) {
      return n2k.fields['Length/Diameter']
    }
  },
  {
    node: 'atonType',
    value: function (n2k) {
      const num = nameMapping[n2k.fields['AtoN Type']]
      if (typeof num !== 'undefined' && (name = schema.getAtonTypeName(num))) {
        return {
          id: num,
          name: name
        }
      } else {
        return null
      }
    }
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
    filter: function (n2k) {
      return (
        n2k.fields['Position reference from Starboard'] &&
        n2k.fields['Beam/Diameter']
      )
    }
  },
  {
    node: 'virtual',
    value: function (n2k) {
      const flag  = n2k.fields['Virtual AtoN Flag']
      return typeof flag != 'undefined' ? flag === 'Yes' : undefined
    }
  },
  {
    node: 'offPosition',
    value: function (n2k) {
      const flag  = n2k.fields['Off Position Indicator']
      return typeof flag != 'undefined' ? flag === 'Yes' : undefined
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
    context: function (n2k) {
      return n2k.fields['User ID'] ? 'atons.urn:mrn:imo:mmsi:' + n2k.fields['User ID'] : undefined
    }
  },
  {
    node: 'sensors.ais.class',
    value: function (n2k) {
      return 'ATON'
    }
  }
]

const nameMapping = {
  'Default: Type of AtoN not specified': 0,
  'Referece point': 1,
  RACON: 2,
  'Fixed structure off-shore': 3,
  'Reserved for future use': 4,
  'Fixed light: without sectors': 5,
  'Fixed light: with sectors': 6,
  'Fixed leading light front': 7,
  'Fixed leading light rear': 8,
  'Fixed beacon: cardinal N': 9,
  'Fixed beacon: cardinal E': 10,
  'Fixed beacon: cardinal S': 11,
  'Fixed beacon: cardinal W': 12,
  'Fixed beacon: port hand': 13,
  'Fixed beacon: starboard hand': 14,
  'Fixed beacon: preferred channel port hand': 15,
  'Fixed beacon: preferred channel starboard hand': 16,
  'Fixed beacon: isolated danger': 17,
  'Fixed beacon: safe water': 18,
  'Floating AtoN: cardinal N': 20,
  'Floating AtoN: cardinal E': 21,
  'Floating AtoN: cardinal S': 22,
  'Floating AtoN: cardinal W': 23,
  'Floating AtoN: port hand mark': 24,
  'Floating AtoN: starboard hand mark': 25,
  'Floating AtoN: preferred channel port hand': 26,
  'Floating AtoN: preferred channel starboard hand': 27,
  'Floating AtoN: isolated danger': 28,
  'Floating AtoN: safe water': 29,
  'Floating AtoN: special mark': 30,
  'Floating AtoN: light vessel/LANBY/rigs': 31
}
