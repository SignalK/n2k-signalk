import { PGN_129284 } from '@canboat/ts-pgns'
import { isoDateTime } from '../utils.js'

const debug = require('debug')('n2k-signalk-129284')

type State = { lastCourseCalculationType?: string }

function calculationType(n2k: PGN_129284, state?: State): string {
  const res =
    (n2k.fields.calculationType as unknown) === 'Great Circle'
      ? 'GreatCircle'
      : 'Rhumbline'
  debug('set calculationType to: ' + res)
  if (typeof state !== 'undefined') state.lastCourseCalculationType = res
  return res
}

const course =
  (path: string, reference = false) =>
  (n2k: PGN_129284, state?: State) =>
    `navigation.course${calculationType(n2k, state)}.${path}` +
    (reference ? n2k.fields.courseBearingReference : '')

module.exports = [
  {
    node: course('bearingTrack', true),
    source: 'bearingOriginToDestinationWaypoint'
  },
  { node: course('nextPoint.distance'), source: 'distanceToWaypoint' },
  {
    node: course('nextPoint.velocityMadeGood'),
    source: 'waypointClosingVelocity'
  },
  {
    node: course('nextPoint.bearing', true),
    source: 'bearingPositionToDestinationWaypoint'
  },
  {
    node: course('nextPoint.position'),
    allowNull: true,
    value: (n2k: PGN_129284) => {
      const p = {
        longitude: Number(n2k.fields.destinationLongitude),
        latitude: Number(n2k.fields.destinationLatitude)
      }
      return isNaN(p.latitude) || isNaN(p.longitude) ? null : p
    }
  },
  {
    node: course('nextPoint.timeToGo'),
    filter: (n2k: PGN_129284) =>
      typeof n2k.fields.etaDate !== 'undefined' &&
      typeof n2k.fields.etaTime !== 'undefined',
    // canboatjs gives the ETA's time of day in seconds.
    value: (n2k: PGN_129284) => {
      const eta = isoDateTime(n2k.fields.etaDate, n2k.fields.etaTime)
      if (eta === null) {
        return null
      }
      return (
        (Date.parse(eta) - new Date(n2k.timestamp as string).getTime()) / 1000
      )
    }
  }
]
