const getMmsiContext = require('../mmsi-context')

module.exports = [
  {
    source: 'SOG',
    node: 'navigation.speedOverGround'
  },
  {
    source: 'COG',
    node: 'navigation.courseOverGroundTrue'
  },
  {
    value: function (n2k) {
      return {
        longitude: Number(n2k.fields.Longitude),
        latitude: Number(n2k.fields.Latitude)
      }
    },
    node: 'navigation.position'
  },
  {
    source: 'Rate of Turn',
    node: 'navigation.rateOfTurn'
  },
  {
    source: 'Heading',
    node: 'navigation.headingTrue'
  },
  {
    node: 'navigation.state',
    value: function (n2k) {
      return stateMapping[n2k.fields['Nav Status']]
    },
    filter: function (n2k) {
      return n2k.fields['Nav Status']
    }
  },
  {
    node: '',
    value: function (n2k) {
      return {
        mmsi: n2k.fields["User ID"].toString()
      }
    }
  },
  {
    context: getMmsiContext
  }
]

const stateMapping = {
  'Under way using engine': 'motoring',
  'At anchor': 'anchored',
  'Not under command': 'not under command',
  'Restricted manoeuverability': 'restricted manouverability',
  'Constrained by her draught': 'constrained by draft',
  Moored: 'moored',
  Aground: 'aground',
  'Engaged in Fishing': 'fishing',
  'Under way sailing': 'sailing',
  'Hazardous material, High Speed': 'hazardous material high speed',
  'Hazardous material, Wing in Ground': 'hazardous material wing in ground',
  'AIS-SART': 'ais-sart'
}
