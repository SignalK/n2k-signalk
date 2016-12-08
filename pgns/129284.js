var CALCULATION_TYPE = "Calculation Type";
var RHUMBLINE = "Rhumb Line";
var GREATCIRCLE = "Great Circle";

function calculationType(n2k) {
  return n2k.fields[CALCULATION_TYPE] === GREATCIRCLE ? 'GreatCircle' : 'Rhumbline';
}

module.exports =  [
  {
    node: function(n2k) {
      return 'navigation.course' + calculationType(n2k) + '.bearingTrack' + n2k.fields["Course/Bearing reference"]
    },
    source: 'Bearing, Origin to Destination Waypoint'
  }, {
    node: function(n2k) {
      return 'navigation.course' + calculationType(n2k) + '.nextPoint'
    },
    value: function(n2k) {
      var result = {
        velocityMadeGood: Number(n2k.fields['Waypoint Closing Velocity']),
        distance: Number(n2k.fields['Distance to Waypoint']),
        position: {
          longitude: Number(n2k.fields['Destination Longitude']),
          latitude: Number(n2k.fields['Destination Latitude'])
        }
      };
      result['bearing' + n2k.fields["Course/Bearing reference"]] =
        n2k.fields['Bearing, Position to Destination Waypoint'];
      return result;
    }
  }
]
