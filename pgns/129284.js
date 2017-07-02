
const debug = require('debug')('n2k-signalk-129284')

var CALCULATION_TYPE = "Calculation Type";
var RHUMBLINE = "Rhumb Line";
var GREATCIRCLE = "Great Circle";

function calculationType(n2k, context) {
  var res = n2k.fields[CALCULATION_TYPE] === GREATCIRCLE ? 'GreatCircle' : 'Rhumbline';
  debug('set calculationType to: ' + res)
  if ( typeof context !== 'undefined' )
    context.lastCourseCalculationType = res
  return res
}

module.exports =  [
  {
    node: function(n2k, context) {
      return 'navigation.course' + calculationType(n2k, context) + '.bearingTrack' + n2k.fields["Course/Bearing reference"]
    },
    source: 'Bearing, Origin to Destination Waypoint'
  },{
    node: function(n2k, context) {
      return 'navigation.course' + calculationType(n2k, context) + '.nextPoint.distance'
    },
    source: 'Distance to Waypoint'
  },{
    node: function(n2k, context) {
      return 'navigation.course' + calculationType(n2k, context) + '.nextPoint.velocityMadeGood'
    },
    source: 'Waypoint Closing Velocity'
  },{
    node: function(n2k, context) {
      return 'navigation.course' + calculationType(n2k, context) + '.nextPoint.bearing' + n2k.fields["Course/Bearing reference"]
    },
    source: 'Bearing, Position to Destination Waypoint'
  },{
    node: function(n2k, context) {
      return 'navigation.course' + calculationType(n2k, context) + '.nextPoint'
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
