const debug = require('debug')('n2k-signalk-129284')

var CALCULATION_TYPE = 'Calculation Type'
var RHUMBLINE = 'Rhumb Line'
var GREATCIRCLE = 'Great Circle'

function calculationType (n2k, state) {
  var res =
    n2k.fields[CALCULATION_TYPE] === GREATCIRCLE ? 'GreatCircle' : 'Rhumbline'
  debug('set calculationType to: ' + res)
  if (typeof state !== 'undefined') state.lastCourseCalculationType = res
  return res
}

module.exports = [
  {
    node: function (n2k, state) {
      return (
        'navigation.course.calcValues.calcMethod' +
        calculationType(n2k, state)
      )
    },
    source: 'Calculation Type'
  },
  {
    node: function (n2k, state) {
      return (
        'navigation.course.calcValues.bearingTrack' +
        n2k.fields['Course/Bearing reference']
      )
    },
    source: 'Bearing, Origin to Destination Waypoint'
  },
  {
    node: function (n2k, state) {
      return (
        'navigation.course.calcValues.distance'
      )
    },
    source: 'Distance to Waypoint'
  },
  {
    node: function (n2k, state) {
      return (
        'navigation.course.calcValues.velocityMadeGood'
      )
    },
    source: 'Waypoint Closing Velocity'
  },
  {
    node: function (n2k, state) {
      return (
        'navigation.course.calcValues.bearing' +
        n2k.fields['Course/Bearing reference']
      )
    },
    source: 'Bearing, Position to Destination Waypoint'
  },
  {
    node: function (n2k, state) {
      return (
        'navigation.course.nextPoint.position'
      )
    },
    value: function (n2k) {
      return {
        longitude: Number(n2k.fields['Destination Longitude']),
        latitude: Number(n2k.fields['Destination Latitude'])
      }
    }
  },
  {
    node: function (n2k) {
      return 'navigation.course.calcValues.timeToGo'
    },
    filter: function (n2k) {
      return n2k.fields['ETA Date'] && n2k.fields['ETA Time']
    },
    value: function (n2k) {
      var dateStr =
        n2k.fields['ETA Date'].replace(/\./g, '-') +
        'T' +
        n2k.fields['ETA Time'] +
        'Z'
      var eta = new Date(dateStr)
      var now = new Date(n2k.timestamp)
      return (eta.getTime() - now.getTime()) / 1000
    }
  }
]
