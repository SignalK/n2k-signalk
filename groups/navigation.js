
function getMmsiContext(n2k) {
  return 'vessels.urn:mrn:imo:mmsi:' + n2k.fields['User ID'];
}

var CALCULATION_TYPE = "Calculation Type";
var RHUMBLINE = "Rhumb Line";
var GREATCIRCLE = "Great Circle";

function calculationType(n2k) {
  return n2k.fields[CALCULATION_TYPE] === GREATCIRCLE ? 'GreatCircle' : 'Rhumbline';
}

exports.mappings = {
  //System time
  '126992': [{
    value: function(n2k) {
      return n2k.fields.Date.replace(/\./g, '-') + "T" + n2k.fields.Time + "Z";
    },
    node: 'navigation.datetime'
  }],
  //Log
  '128275': [{
    source: 'Trip Log',
    node: 'navigation.logTrip'
  }, {
    source: 'Log',
    node: 'navigation.log'
  }],
  //COGSOG,
  '129026': [{
    source: 'SOG',
    node: 'navigation.speedOverGround'
  }, {
    source: 'COG',
    node: 'navigation.courseOverGroundTrue',
    filter: function(n2k) {
      return n2k.fields['COG Reference'] === 'True';
    }
  }, {
    source: 'COG',
    node: 'navigation.courseOverGroundMagnetic',
    filter: function(n2k) {
      return n2k.fields['COG Reference'] === 'Magnetic';
    }
  }],
  '129025': [{
    value: function(n2k) {
      return {
        longitude: Number(n2k.fields.Longitude),
        latitude: Number(n2k.fields.Latitude)
      }
    },
    node: 'navigation.position'
  }],
  //Vessel heading
  '127250': [{
    source: 'Heading',
    node: 'navigation.headingMagnetic',
    filter: function(n2k) {
      return n2k.fields['Reference'] === 'Magnetic' && typeof n2k.fields['Heading'] != 'undefined'
    }
  }, {
    source: 'Heading',
    node: 'navigation.headingTrue',
    filter: function(n2k) {
      return n2k.fields['Reference'] === 'True' && typeof n2k.fields['Heading'] != 'undefined'
    }
  }, {
    source: 'Variation',
    node: 'navigation.magneticVariation',
    filter: function(n2k) {
      return typeof n2k.fields['Variation'] != 'undefined'
    }
  }],
  //Attitude
  '127257': [{
    value: function(n2k) {
      return {
        yaw: Number(n2k.fields.Yaw),
        pitch: Number(n2k.fields.Pitch),
        roll: Number(n2k.fields.Roll)
      }
    },
    node: 'navigation.attitude'
  }],

    //Rate of turn
  '127251': [{
    source: 'Rate',
    node: 'navigation.rateOfTurn'
  }],
  '127258': [{
    source: 'Variation',
    node: 'navigation.magneticVariation'
  }],
  //Speed
  '128259': [{
    source: 'Speed Water Referenced',
    node: 'navigation.speedThroughWater',
    filter: function(n2k) {
      return n2k.fields['Speed Water Referenced']
    }
  }, {
    source: 'Speed Ground Referenced',
    node: 'navigation.speedOverGround',
    filter: function(n2k) {
      return n2k.fields['Speed Ground Referenced']
    }
  }],
  //Direction data
  '130577': [{
    source: 'COG',
    node: 'navigation.courseOverGroundTrue',
    filter: function(n2k) {
      return n2k.fields['COG Reference'] === 'True';
    }
  }, {
    source: 'SOG',
    node: 'navigation.speedOverGround',
    filter: function(n2k) {
      return n2k.fields['SOG'];
    }
  }, {
    node: 'environment.current',
    filter: function(n2k) {
      return n2k.fields['Drift'] && n2k.fields['Set'];
    },
    value: function(n2k) {
      if (n2k.fields['COG Reference'] === 'True') {
        return {
          setTrue: Number(n2k.fields.Set),
          drift: Number(n2k.fields['Drift'])
        };
      } else if (n2k.fields['Set Reference'] === 'Magnetic') {
        //speculative, I don't have a real world sample showing 'Magnetic'
        return {
          setTrue: Number(n2k.fields.Set),
          drift: Number(n2k.fields['Drift'])
        };
      }
    }
  }],
  //Navigation data
  '129284': [{
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
  }],
    '129038': [{
    source: 'SOG',
    node: 'navigation.speedOverGround'
  }, {
    source: 'COG',
    node: 'navigation.courseOverGroundTrue'
  }, {
    value: function(n2k) {
      return {
        longitude: Number(n2k.fields.Longitude),
        latitude: Number(n2k.fields.Latitude)
      }
    },
    node: 'navigation.position'
  }, {
    context: getMmsiContext
  }],
  '129039': [{
    source: 'SOG',
    node: 'navigation.speedOverGround'
  }, {
    source: 'COG',
    node: 'navigation.courseOverGroundTrue'
  }, {
    value: function(n2k) {
      return {
        longitude: Number(n2k.fields.Longitude),
        latitude: Number(n2k.fields.Latitude)
      }
    },
    node: 'navigation.position'
  }, {
    context: getMmsiContext
  }]
}
