import { PGN_129041, AtonType } from '@canboat/ts-pgns'

import { getMmsiContext } from '../mmsi-context'
import getFromStarboard from '../aisFromStarboard'
const schema = require('@signalk/signalk-schema')

module.exports = [
  {
    node: '',
    filter: (n2k: PGN_129041) => n2k.fields.atonName,
    value: function (n2k: PGN_129041) {
      return {
        name: n2k.fields.atonName
      }
    }
  },
  {
    filter: (n2k: PGN_129041) => n2k.fields.longitude && n2k.fields.latitude,
    value: function (n2k: PGN_129041) {
      return {
        longitude: Number(n2k.fields.longitude),
        latitude: Number(n2k.fields.latitude)
      }
    },
    node: 'navigation.position'
  },
  {
    node: 'design.length',
    value: function (n2k: PGN_129041) {
      return { overall: Number(n2k.fields.lengthDiameter) }
    },
    filter: function (n2k: PGN_129041) {
      return n2k.fields.lengthDiameter
    }
  },
  {
    node: 'atonType',
    value: function (n2k: PGN_129041) {
      let num: number | undefined = undefined
      if (n2k.fields.atonType) {
        num = nameMapping[n2k.fields.atonType]
      }
      const name = schema.getAtonTypeName(num)
      if (typeof num !== 'undefined' && name !== undefined) {
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
    source: 'beamDiameter'
  },
  {
    node: 'sensors.ais.fromBow',
    source: 'positionReferenceFromBow'
  },
  {
    node: 'sensors.ais.fromCenter',
    value: getFromStarboard,
    filter: function (n2k: PGN_129041) {
      return (
        n2k.fields.positionReferenceFromStarboardEdge && n2k.fields.beamDiameter
      )
    }
  },
  {
    node: 'virtual',
    value: function (n2k: PGN_129041) {
      const flag = n2k.fields.virtualAtonFlag
      return typeof flag != 'undefined' ? flag === 'Yes' : undefined
    }
  },
  {
    node: 'offPosition',
    value: function (n2k: PGN_129041) {
      const flag = n2k.fields.offPositionIndicator
      return typeof flag != 'undefined' ? flag === 'Yes' : undefined
    }
  },
  {
    node: '',
    filter: (n2k: PGN_129041) => n2k.fields.userId,
    value: function (n2k: PGN_129041) {
      return {
        mmsi: n2k.fields.userId.toString()
      }
    }
  },
  {
    context: function (n2k: PGN_129041) {
      return n2k.fields.userId
        ? 'atons.urn:mrn:imo:mmsi:' + n2k.fields.userId
        : 'atons.unknown'
    }
  },
  {
    node: 'sensors.ais.class',
    value: function (n2k: PGN_129041) {
      return 'ATON'
    }
  }
]

const nameMapping: { [key: string]: number } = {
  [AtonType.DefaultTypeOfAtoNNotSpecified]: 0,
  [AtonType.ReferencePoint]: 1,
  [AtonType.Racon]: 2,
  [AtonType.FixedStructureOffShore]: 3,
  [AtonType.ReservedForFutureUse]: 4,
  [AtonType.FixedLightWithoutSectors]: 5,
  [AtonType.FixedLightWithSectors]: 6,
  [AtonType.FixedLeadingLightFront]: 7,
  [AtonType.FixedLeadingLightRear]: 8,
  [AtonType.FixedBeaconCardinalN]: 9,
  [AtonType.FixedBeaconCardinalE]: 10,
  [AtonType.FixedBeaconCardinalS]: 11,
  [AtonType.FixedBeaconCardinalW]: 12,
  [AtonType.FixedBeaconPortHand]: 13,
  [AtonType.FixedBeaconStarboardHand]: 14,
  [AtonType.FixedBeaconPreferredChannelPortHand]: 15,
  [AtonType.FixedBeaconPreferredChannelStarboardHand]: 16,
  [AtonType.FixedBeaconIsolatedDanger]: 17,
  [AtonType.FixedBeaconSafeWater]: 18,
  [AtonType.FixedBeaconSpecialMark]: 19,
  [AtonType.FloatingAtoNCardinalN]: 20,
  [AtonType.FloatingAtoNCardinalE]: 21,
  [AtonType.FloatingAtoNCardinalS]: 22,
  [AtonType.FloatingAtoNCardinalW]: 23,
  [AtonType.FloatingAtoNPortHandMark]: 24,
  [AtonType.FloatingAtoNStarboardHandMark]: 25,
  [AtonType.FloatingAtoNPreferredChannelPortHand]: 26,
  [AtonType.FloatingAtoNPreferredChannelStarboardHand]: 27,
  [AtonType.FloatingAtoNIsolatedDanger]: 28,
  [AtonType.FloatingAtoNSafeWater]: 29,
  [AtonType.FloatingAtoNSpecialMark]: 30,
  [AtonType.FloatingAtoNLightVessellanbyrigs]: 31
}
