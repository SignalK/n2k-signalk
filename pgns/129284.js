
const debug = require('debug')('n2k-signalk-129284')
const state = require('../state')

var CALCULATION_TYPE = "Calculation Type";
var RHUMBLINE = "Rhumb Line";
var GREATCIRCLE = "Great Circle";

function calculationType(n2k) {
  var res = n2k.fields[CALCULATION_TYPE] === GREATCIRCLE ? 'GreatCircle' : 'Rhumbline';
  debug('set calculationType to: ' + res)
  state.lastCourseCalculationType = res
  return res
}

module.exports =  [
  {
    node: function(n2k) {
      return 'navigation.course' + calculationType(n2k) + '.bearingTrack' + n2k.fields["Course/Bearing reference"]
    },
    source: 'Bearing, Origin to Destination Waypoint'
  },{
    node: function(n2k) {
      return 'navigation.course' + calculationType(n2k) + '.nextPoint.distance'
    },
    source: 'Distance to Waypoint'
  },{
    node: function(n2k) {
      return 'navigation.course' + calculationType(n2k) + '.nextPoint.velocityMadeGood'
    },
    source: 'Waypoint Closing Velocity'
  },{
    node: function(n2k) {
      return 'navigation.course' + calculationType(n2k) + '.nextPoint.bearing' + n2k.fields["Course/Bearing reference"]
    },
    source: 'Bearing, Position to Destination Waypoint'
  },{
    node: function(n2k) {
      return 'navigation.course' + calculationType(n2k) + '.nextPoint'
    },
    value: function(n2k) {
      return {
        position: {
          longitude: Number(n2k.fields['Destination Longitude']),
          latitude: Number(n2k.fields['Destination Latitude'])
        }
      }
    }
  }
]
