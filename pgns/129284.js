const debug = require('debug')('n2k-signalk-129284')

var GREATCIRCLE = 'Great Circle'

function calculationType (n2k, state) {
  var res =
    n2k.fields.calculationType === GREATCIRCLE ? 'GreatCircle' : 'Rhumbline'
  debug('set calculationType to: ' + res)
  if (typeof state !== 'undefined') state.lastCourseCalculationType = res
  return res
}

module.exports = [
  {
    node: function (n2k, state) {
      return (
        'navigation.course' +
        calculationType(n2k, state) +
        '.bearingTrack' +
        n2k.fields.courseBearingReference
      )
    },
    source: 'bearingOriginToDestinationWaypoint'
  },
  {
    node: function (n2k, state) {
      return (
        'navigation.course' +
        calculationType(n2k, state) +
        '.nextPoint.distance'
      )
    },
    source: 'distanceToWaypoint'
  },
  {
    node: function (n2k, state) {
      return (
        'navigation.course' +
        calculationType(n2k, state) +
        '.nextPoint.velocityMadeGood'
      )
    },
    source: 'waypointClosingVelocity'
  },
  {
    node: function (n2k, state) {
      return (
        'navigation.course' +
        calculationType(n2k, state) +
        '.nextPoint.bearing' +
        n2k.fields.courseBearingReference
      )
    },
    source: 'bearingPositionToDestinationWaypoint'
  },
  {
    node: function (n2k, state) {
      return (
        'navigation.course' +
        calculationType(n2k, state) +
        '.nextPoint.position'
      )
    },
    value: function (n2k) {
      return {
        longitude: Number(n2k.fields.destinationLongitude),
        latitude: Number(n2k.fields.destinationLatitude)
      }
    }
  },
  {
    node: function (n2k) {
      return 'navigation.course' + calculationType(n2k) + '.nextPoint.timeToGo'
    },
    filter: function (n2k) {
      return n2k.fields.etaDate && n2k.fields.etaTime
    },
    value: function (n2k) {
      var dateStr =
        n2k.fields.etaDate.replace(/\./g, '-') + 'T' + n2k.fields.etaTime + 'Z'
      var eta = new Date(dateStr)
      var now = new Date(n2k.timestamp)
      return (eta.getTime() - now.getTime()) / 1000
    }
  }
]
