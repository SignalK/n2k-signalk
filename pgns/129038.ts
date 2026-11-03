import { PGN_129038 } from '@canboat/ts-pgns'

const getMmsiContext = require('../mmsi-context').getMmsiContext

module.exports = [
  {
    source: 'sog',
    node: 'navigation.speedOverGround'
  },
  {
    source: 'cog',
    node: 'navigation.courseOverGroundTrue'
  },
  {
    filter: (n2k: PGN_129038) => n2k.fields.longitude && n2k.fields.latitude,
    value: function (n2k: PGN_129038) {
      return {
        longitude: Number(n2k.fields.longitude),
        latitude: Number(n2k.fields.latitude)
      }
    },
    node: 'navigation.position'
  },
  {
    source: 'rateOfTurn',
    node: 'navigation.rateOfTurn'
  },
  {
    source: 'heading',
    node: 'navigation.headingTrue'
  },
  {
    node: 'navigation.state',
    value: function (n2k: PGN_129038) {
      return stateMapping[(n2k.fields.navStatus as unknown) as string]
    },
    filter: function (n2k: PGN_129038) {
      return n2k.fields.navStatus
    }
  },
  {
    node: 'navigation.specialManeuver',
    value: function (n2k: PGN_129038) {
      return specialManeuverMapping[
        (n2k.fields.specialManeuverIndicator as unknown) as string
      ]
    },
    filter: function (n2k: PGN_129038) {
      return n2k.fields.specialManeuverIndicator
    }
  },
  {
    node: '',
    filter: (n2k: PGN_129038) => n2k.fields.userId,
    value: function (n2k: PGN_129038) {
      return {
        mmsi: n2k.fields.userId!.toString()
      }
    }
  },
  {
    context: getMmsiContext
  },
  {
    node: 'sensors.ais.class',
    value: function (n2k: PGN_129038) {
      return 'A'
    }
  }
]

const stateMapping: Record<string, string> = {
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

const specialManeuverMapping: Record<string, string> = {
  'Not available': 'not available',
  'Not engaged in special maneuver': 'not engaged',
  'Engaged in special maneuver': 'engaged',
  Reserverd: 'reserved'
}
