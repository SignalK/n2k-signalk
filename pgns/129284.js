
const debug = require('debug')('n2k-signalk-129284')

var CALCULATION_TYPE = "Calculation Type";
var RHUMBLINE = "Rhumb Line";
var GREATCIRCLE = "Great Circle";

function calculationType(n2k, state) {
  var res = n2k.fields[CALCULATION_TYPE] === GREATCIRCLE ? 'GreatCircle' : 'Rhumbline';
  debug('set calculationType to: ' + res)
  if ( typeof state !== 'undefined' )
    state.lastCourseCalculationType = res
  return res
}

module.exports =  [
  {
    node: function(n2k, state) {
      return 'navigation.course' + calculationType(n2k, state) + '.bearingTrack' + n2k.fields["Course/Bearing reference"]
    },
    source: 'Bearing, Origin to Destination Waypoint'
  },{
    node: function(n2k, state) {
      return 'navigation.course' + calculationType(n2k, state) + '.nextPoint.distance'
    },
    source: 'Distance to Waypoint'
  },{
    node: function(n2k, state) {
      return 'navigation.course' + calculationType(n2k, state) + '.nextPoint.velocityMadeGood'
    },
    source: 'Waypoint Closing Velocity'
  },{
    node: function(n2k, state) {
      return 'navigation.course' + calculationType(n2k, state) + '.nextPoint.bearing' + n2k.fields["Course/Bearing reference"]
    },
    source: 'Bearing, Position to Destination Waypoint'
  },{
    node: function(n2k, state) {
      return 'navigation.course' + calculationType(n2k, state) + '.nextPoint'
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
