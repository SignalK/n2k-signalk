import { AisSpecialManeuver, NavStatus, PGN_129038 } from '@canboat/ts-pgns'
import { isPosition } from '../utils.js'

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
    filter: (n2k: PGN_129038) =>
      isPosition(n2k.fields.latitude, n2k.fields.longitude),
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
      return stateMapping[n2k.fields.navStatus as unknown as string]
    },
    filter: function (n2k: PGN_129038) {
      return (
        stateMapping[n2k.fields.navStatus as unknown as string] !== undefined
      )
    }
  },
  {
    node: 'navigation.specialManeuver',
    value: function (n2k: PGN_129038) {
      return specialManeuverMapping[
        n2k.fields.specialManeuverIndicator as unknown as string
      ]
    },
    filter: function (n2k: PGN_129038) {
      return (
        specialManeuverMapping[
          n2k.fields.specialManeuverIndicator as unknown as string
        ] !== undefined
      )
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
    value: function (_n2k: PGN_129038) {
      return 'A'
    }
  }
]

// Keyed by canboat's names, so that a key cannot be misspelt.
const stateMapping: Record<string, string> = {
  [NavStatus.UnderWayUsingEngine]: 'motoring',
  [NavStatus.AtAnchor]: 'anchored',
  [NavStatus.NotUnderCommand]: 'not under command',
  [NavStatus.RestrictedManeuverability]: 'restricted manouverability',
  [NavStatus.ConstrainedByHerDraught]: 'constrained by draft',
  [NavStatus.Moored]: 'moored',
  [NavStatus.Aground]: 'aground',
  [NavStatus.EngagedInFishing]: 'fishing',
  [NavStatus.UnderWaySailing]: 'sailing',
  [NavStatus.HazardousMaterialHighSpeed]: 'hazardous material high speed',
  [NavStatus.HazardousMaterialWingInGround]:
    'hazardous material wing in ground',
  [NavStatus.PowerDrivenVesselTowingAstern]: 'towing astern',
  [NavStatus.PowerDrivenVesselPushingAheadOrTowingAlongside]:
    'pushing ahead or towing alongside',
  [NavStatus.AisSart]: 'ais-sart'
}

const specialManeuverMapping: Record<string, string> = {
  [AisSpecialManeuver.NotAvailable]: 'not available',
  [AisSpecialManeuver.NotEngagedInSpecialManeuver]: 'not engaged',
  [AisSpecialManeuver.EngagedInSpecialManeuver]: 'engaged',
  [AisSpecialManeuver.Reserved]: 'reserved'
}
