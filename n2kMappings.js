var CALCULATION_TYPE = "Calculation Type";
var RHUMBLINE = "Rhumb Line";
var GREATCIRCLE = "Great Circle";

function calculationType(n2k) {
  return n2k.fields[CALCULATION_TYPE] === GREATCIRCLE ? 'GreatCircle' : 'Rhumbline';
}

function getMmsiContext(n2k) {
  return 'vessels.urn:mrn:imo:mmsi:' + n2k.fields['User ID'];
}



exports.mappings = {
  //System time
  '126992': [{
    value: function(n2k) {
      return n2k.fields.Date.replace(/\./g, '-') + "T" + n2k.fields.Time + "Z";
    },
    node: 'navigation.datetime'
  }],
  //Water Depth
  '128267': [{
    source: 'Depth',
    node: 'environment.depth.belowTransducer'
  }, {
    source: 'Offset',
    node: 'environment.depth.surfaceToTransducer',
    filter: function(n2k) { return typeof n2k.fields['Offset'] != 'undefined' && n2k.fields['Offset'] > 0 }
  }, {
    source: 'Offset',
    node: 'environment.depth.transducerToKeel',
    filter: function(n2k) { return typeof n2k.fields['Offset'] != 'undefined' && n2k.fields['Offset'] < 0 }
  }, {
    node: 'environment.depth.belowSurface',
    filter: function(n2k) {
      return typeof n2k.fields['Depth'] != 'undefined' && typeof n2k.fields['Offset'] != 'undefined' && n2k.fields['Offset'] > 0
    },
    value: function(n2k) {
      return Number(n2k.fields.Depth) + Number(n2k.fields.Offset)
    },
  }, {
    node: 'environment.depth.belowKeel',
    filter: function(n2k) {
      return typeof n2k.fields['Depth'] != 'undefined' && typeof n2k.fields['Offset'] != 'undefined' && n2k.fields['Offset'] < 0
    },
    value: function(n2k) {
      return Number(n2k.fields.Depth) + Number(n2k.fields.Offset)
    }
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
  //Rudder
  '127245': [{
    source: 'Position',
    node: 'steering.rudderAngle',
    filter: function(n2k) {
      return typeof n2k.fields['Position'] != 'undefined'
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
  // Engine speed data
  '127488': [{
    node: 'propulsion.port.revolutions',
    filter: function(n2k) {
      return n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port';
    },
    value: function(n2k) {
      var rpm = Number(n2k.fields['Engine Speed'])
      return rpm / 60.0;
    }
  }, {
    node: 'propulsion.starboard.revolutions',
    filter: function(n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard';
    },
    value: function(n2k) {
      var rpm = Number(n2k.fields['Engine Speed'])
      return rpm / 60.0;
    }
  }],
  // Engine operating parameters
  '127489': [{
    source: 'Temperature',
    node: 'propulsion.port.temperature',
    filter: function(n2k) {
      return n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port';
    }
  }, {
    source: 'Temperature',
    node: 'propulsion.starboard.temperature',
    filter: function(n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard';
    }
  }, {
    source: 'Alternator Potential',
    node: 'propulsion.port.alternatorVoltage',
    filter: function(n2k) {
      return n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port';
    }
  }, {
    source: 'Alternator Potential',
    node: 'propulsion.starboard.alternatorVoltage',
    filter: function(n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard';
    }
  }, {
    source: 'Fuel Rate',
    node: 'propulsion.port.fuel.rate',
    filter: function(n2k) {
      return n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port';
    }
  }, {
    source: 'Fuel Rate',
    node: 'propulsion.starboard.fuel.rate',
    filter: function(n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard';
    },
  }, {
    node: 'propulsion.port.oilPressure',
    filter: function(n2k) {
      return n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port';
    },
    value: function(n2k) {
      var kpa = Number(n2k.fields['Oil pressure'])
      return kpa * 1000.0;
    }
  }, {
    node: 'propulsion.starboard.oilPressure',
    filter: function(n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard';
    },
    value: function(n2k) {
      var kpa = Number(n2k.fields['Oil pressure'])
      return kpa * 1000.0;
    }
  }, {
    source: 'Total Engine hours',
    node: 'propulsion.port.runTime',
    filter: function(n2k) {
      return n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port';
    }
  }, {
    source: 'Total Engine hours',
    node: 'propulsion.starboard.runTime',
    filter: function(n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard';
    }
  }],
  // Fluid Level
  '127505': [{
    node: function(n2k) {
      return 'tanks.' + tankMappings[n2k.fields['Type']] + '.' + n2k.fields['Instance'] + '.currentLevel'
    },
    source: 'Level'
  }, {
    node: function(n2k) {
      return 'tanks.' + tankMappings[n2k.fields['Type']] + '.' + n2k.fields['Instance'] + '.capacity'
    },
    source: 'Capacity'
  }],
  //Wind data
  '130306': [{
    source: 'Wind Speed',
    node: 'environment.wind.speedApparent',
    filter: function(n2k) {
      return n2k.fields['Reference'] === 'Apparent';
    }
  }, {
    source: 'Wind Speed',
    node: 'environment.wind.speedTrue',
    filter: function(n2k) {
      return n2k.fields['Reference'] === 'True (boat referenced)';
    }
  }, {
    source: 'Wind Speed',
    node: 'environment.wind.speedOverGround',
    filter: function(n2k) {
      return n2k.fields['Reference'] === 'True (ground referenced to North)';
    }
  }, {
    node: 'environment.wind.angleApparent',
    filter: function(n2k) {
      return n2k.fields['Reference'] === 'Apparent';
    },
    value: function(n2k) {
      var angle = Number(n2k.fields['Wind Angle'])
      return angle <= Math.PI ? angle : angle - (Math.PI * 2);
    }
  }, {
    source: 'Wind Angle',
    node: 'environment.wind.angleTrueWater',
    filter: function(n2k) {
      return n2k.fields['Reference'] === 'True (boat referenced)';
    }
  }, {
    source: 'Wind Angle',
    node: 'environment.wind.directionTrue',
    filter: function(n2k) {
      return n2k.fields['Reference'] === 'True (ground referenced to North)';
    }
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


  //Set & Drift rapid update
  '129291': [{
    node: 'environment.current',
    value: function(n2k) {
      if (n2k.fields['Set Reference'] === 'True') {
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
  }],
  '129809': [{
    node: '',
    value: function(n2k) {
      return {
        name: n2k.fields.Name
      }
    }
  }, {
    context: getMmsiContext
  }],
  '129794': [{
    node: '',
    value: function(n2k) {
      return {
        name: n2k.fields.Name
      }
    }
  }, {
    context: getMmsiContext
  }],

  //Temp & humidity
  '130310': [{
    source: 'Outside Ambient Air Temperature',
    node: 'environment.outside.temperature',
    filter: function(n2k) {
      return n2k.fields['Outside Ambient Air Temperature']
    }
  }, {
    node: 'environment.outside.pressure',
    filter: function(n2k) {
      return n2k.fields['Atmospheric Pressure']
    },
    value: function(n2k) {
      var hpa = Number(n2k.fields['Atmospheric Pressure'])
      return hpa * 100.0;
    }
  }],
  //Temp, humidity and pressure
  '130311': [{
    node: function(n2k) {
      var temperatureMapping = temperatureMappings[n2k.fields["Temperature Source"]];
      if (temperatureMapping) {
        return temperatureMapping.path;
      }
    },
    source: 'Temperature'
  }, {
    node: function(n2k) {
      return 'environment.' +
        (n2k.fields["Humidity Source"] === 'Inside' ? 'inside' : 'outside') +
        '.humidity';
    },
    source: 'Humidity'
  }, {
    node: 'environment.outside.pressure',
    filter: function(n2k) {
      return n2k.fields['Atmospheric Pressure']
    },
    value: function(n2k) {
      var hpa = Number(n2k.fields['Atmospheric Pressure'])
      return hpa * 100.0;
    }
  }],
  //Temperature
  '130312': [{
    node: function(n2k) {
      var temperatureMapping = temperatureMappings[n2k.fields["Temperature Source"]];
      if (temperatureMapping) {
        return temperatureMapping.path;
      }
    },
    instance: function(n2k) {
      return n2k.fields["Temperature Instance"] + '';
    },
    source: 'Actual Temperature'
  }],

  //Battery Voltage
  '127508': [{
    source: 'Voltage',
    node: function(n2k) {
      return 'electrical.batteries.' + n2k.fields['Battery Instance'] + '.voltage'
    },
  }],

  // Seatalk: Pilot Wind Datum
  '65345': [{
    node: 'steering.autopilot.target.windAngleApparent',
    value: function(n2k) {
      var angle = Number(n2k.fields['Wind Datum'])
      if ( angle > Math.PI )
        angle = angle-(Math.PI*2);
      return angle;
    }   
  }],

  //Seatalk: Pilot Mode
  '65379': [{
    node: 'steering.autopilot.state',
    value: function(n2k) {
      var mode = Number(n2k.fields['Pilot Mode']);
      var subMode = Number(n2k.fields['Sub Mode']);
      if ( mode == 0 && subMode == 0 )
        return 'standby';
      else if ( mode == 0 && subMode == 1 )
        return 'wind';
      else if ( (mode == 128 || mode == 129) && subMode == 1 )
        return 'route';
      else if ( mode == 64 && subMode == 0 )
        return 'auto';
      else
        return 'standby';
    }
  }],

  //Seatalk: Pilot Locked Heading
  '65360': [{
    node: 'steering.autopilot.target.headingTrue',
    filter: function(n2k) {
      return n2k.fields['Target Heading True']
    },
    source: 'Target Heading True'
  },{
    node: 'steering.autopilot.target.headingMagnetic',
    filter: function(n2k) {
      return n2k.fields['Target Heading Magnetic']
    },
    source: 'Target Heading Magnetic'
  }],

  // Seatalk: Alarm
  '65288': [{
    node: function(n2k) {
      var alarmName = n2k.fields['Alarm Group'].toLowerCase().replace(/ /g, '') + '.' + n2k.fields['Alarm ID'].replace(/ /g, '');
      return 'notifications.' + alarmName;
    },
    value: function(n2k) {
      var state = n2k.fields['Alarm Status'];

      var method = [ 'visual' ];

      if ( state == 'Alarm condition met and not silenced' ) {
        method.push('sound');
      }

      if ( state == 'Alarm condition not met' ) {
        state = 'normal'
      } else {
        state = 'alarm'
      }


      return {
        message: n2k.fields['Alarm ID'],
        method: method,
        state: state,
        timestamp: n2k.timestamp
      }
    }
  }]
}

/*
{"0": "Sea Temperature"},
{"1": "Outside Temperature"},
{"2": "Inside Temperature"},
{"3": "Engine Room Temperature"},
{"4": "Main Cabin Temperature"},
{"5": "Live Well Temperature"},
{"6": "Bait Well Temperature"},
{"7": "Refrigeration Temperature"},
{"8": "Heating System Temperature"},
{"9": "Dew Point Temperature"},
{"10": "Apparent Wind Chill Temperature"},
{"11": "Theoretical Wind Chill Temperature"},
{"12": "Heat Index Temperature"},
{"13": "Freezer Temperature"},
{"14": "Exhaust Gas Temperature"}]},
*/
var temperatureMappings = {
  "Sea Temperature": {
    path: 'environment.water.temperature'
  },
  "Outside Temperature": {
    path: 'environment.outside.temperature'
  },
  "Inside Temperature": {
    path: 'environment.inside.temperature'
  },
  "Engine Room Temperature": {
    path: 'environment.inside.engineRoom.temperature'
  },
  "Main Cabin Temperature": {
    path: 'environment.inside.mainCabin.temperature'
  },
  "Live Well Temperature": {
    path: 'environment.water.liveWell.temperature'
  },
  "Bait Well Temperature": {
    path: 'environment.water.baitWell.temperature'
  },
  "Refrigerator Temperature": {
    path: 'environment.inside.refrigerator.temperature'
  },
  "Heating System Temperature": {
    path: 'environment.inside.heating.temperature'
  },
  "Dew Point Temperature": {
    path: 'environment.outside.dewPointTemperature'
  },
  "Apparent Wind Chill Temperature": {
    path: 'environment.outside.apparentWindChillTemperature'
  },
  "Theoretical Wind Chill Temperature": {
    path: 'environment.outside.theoreticalWindChillTemperature'
  },
  "Heat Index Temperature": {
    path: 'environment.outside.heatIndexTemperature'
  },
  "Heat Index Temperature": {
    path: 'environment.outside.heatIndexTemperature'
  },
  "Freezer Temperature": {
    path: 'environment.inside.freezer.temperature'
  },
  "Exhaust Gas Temperature": {
    path: 'propulsion.exhaust.temperature'
  }
}

var tankMappings = {
  "Fuel": "fuel",
  "Water": "freshWater",
  "Gray water": "wasteWater",
  "Live well": "liveWell",
  "Oil": "lubrication",
  "Black water": "blackWater"
}

exports.temperatureMappings = temperatureMappings;
