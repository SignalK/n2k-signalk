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
    source: 'Engine Speed',
    node: 'propulsion.port.revolutions',
    filter: function(n2k) {
      return n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port';
    }
  }, {
    source: 'Engine Speed',
    node: 'propulsion.starboard.revolutions',
    filter: function(n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard';
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
    node: 'propulsion.port.fuelRate',
    filter: function(n2k) {
      return n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port';
    }
  }, {
    source: 'Fuel Rate',
    node: 'propulsion.starboard.fuelRate',
    filter: function(n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard';
    }
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
    source: 'Wind Angle',
    node: 'environment.wind.angleApparent',
    filter: function(n2k) {
      return n2k.fields['Reference'] === 'Apparent';
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
    node: 'navigation.position.variation'
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


  //Temperature
  '130312': [{
    node: function(n2k) {
      var prefix = '';
      var postfix = '';
      var temperatureMapping = temperatureMappings[n2k.fields["Temperature Source"]];
      if (temperatureMapping) {
        return temperatureMapping.prefix + n2k.fields["Temperature Instance"] + temperatureMapping.postfix;
      }
    },
    source: 'Actual Temperature'
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
{"7": "Refridgeration Temperature"},
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
      prefix: 'environment.sea.',
      postfix: '.temperature'
    },
    "Outside Temperature": {
      prefix: 'environment.air.outside.',
      postfix: '.temperature'
    },
    "Inside Temperature": {
      prefix: 'environment.air.inside.',
      postfix: '.temperature'
    },
    "Engine Room Temperature": {
      prefix: 'environment.air.inside.engineRoom.',
      postfix: '.temperature'
    },
    "Main Cabin Temperature": {
      prefix: 'environment.air.inside.maincabin.',
      postfix: '.temperature'
    },
    "Live Well Temperature": {
      prefix: 'environment.well.live.',
      postfix: '.temperature'
    },
    "Bait Well Temperature": {
      prefix: 'environment.well.bait.',
      postfix: '.temperature'
    },
    "Refridgeration Temperature": {
      prefix: 'environment.refridgeration.',
      postfix: '.temperature'
    },
    "Heating System Temperature": {
      prefix: 'environment.heating.',
      postfix: '.temperature'
    },
    "Dew Point Temperature": {
      prefix: 'environment.air.',
      postfix: '.dewPointTemperature'
    },
    "Apparent Wind Chill Temperature": {
      prefix: 'environment.air.',
      postfix: '.apparentWindChillTemperature'
    },
    "Theoretical Wind Chill Temperature": {
      prefix: 'environment.air.',
      postfix: '.theoreticalWindChillTemperature'
    },
    "Heat Index Temperature": {
      prefix: 'environment.air.',
      postfix: '.heatIndexTemperature'
    },
    "Heat Index Temperature": {
      prefix: 'environment.air.',
      postfix: '.heatIndexTemperature'
    },
    "Freezer Temperature": {
    prefix: 'environment.freezer.',
    postfix: '.temperature'
  },
  "Exhaust Gas Temperature": {
    prefix: 'propulsion.exhaust.',
    postfix: '.temperature'
  }
}
