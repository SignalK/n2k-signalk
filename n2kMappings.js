function getMmsiContext(n2k) {
  return 'vessels.urn:mrn:imo:mmsi:' + n2k.fields['User ID'];
}

exports.mappings =
{
  //System time
  '126992': [
    {
      value: function (n2k) {
        return n2k.fields.Date;
      },
      node: 'environment.date'
    },
    {
      value: function (n2k) {
        return n2k.fields.Time;
      },
      node: 'environment.time'
    },
  ],
  //Water Depth
  '128267': [
    {
      source: 'Depth',
      node: 'environment.depth.belowTransducer'
    }
  ],
  //Log
  '128275': [
    {
      source: 'Trip Log',
      node: 'navigation.logTrip'
    },
    {
      source: 'Log',
      node: 'navigation.log'
    }
  ],
  //COGSOG,
  '129026': [
    {
      source: 'SOG',
      node: 'navigation.speedOverGround'
    },
    {
      source: 'COG',
      node: 'navigation.courseOverGroundTrue',
      filter: function (n2k) {
        return n2k.fields['COG Reference'] === 'True';
      }
    },
    {
      source: 'COG',
      node: 'navigation.courseOverGroundMagnetic',
      filter: function (n2k) {
        return n2k.fields['COG Reference'] === 'Magnetic';
      }
    }
  ],
  '129025': [
    {
      value: function (n2k) {
        return {
          longitude: Number(n2k.fields.Longitude),
          latitude: Number(n2k.fields.Latitude)
        }
      },
      node: 'navigation.position'
    }
  ],
  //Vessel heading
  '127250': [
    {
      source: 'Heading',
      node: 'navigation.headingMagnetic',
      filter: function (n2k) {
        return n2k.fields['Reference'] === 'Magnetic' && typeof n2k.fields['Heading'] != 'undefined'
      }
    },
    {
      source: 'Variation',
      node: 'navigation.magneticVariation',
      filter: function (n2k) {
        return typeof n2k.fields['Variation'] != 'undefined'
      }
    }
  ],
  //Rudder
  '127245': [
    {
      source: 'Position',
      node: 'steering.rudderAngle',
      filter: function (n2k) {
        return typeof n2k.fields['Position'] != 'undefined'
      }
    }
  ],
  //Attitude
  '127257': [
    {
      value: function (n2k) {
        return {
          yaw: Number(n2k.fields.Yaw),
          pitch: Number(n2k.fields.Pitch),
          roll: Number(n2k.fields.Roll)
        }
      },
      node: 'navigation.attitude'
    }
  ],
	// Engine speed data
	'127488': [
    {
      source: 'Engine Speed',
      node: 'propulsion.port.revolutions',
      filter: function (n2k) {
        return n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port';
      }
    },
    {
      source: 'Engine Speed',
      node: 'propulsion.starboard.revolutions',
      filter: function (n2k) {
        return n2k.fields['Engine Instance'] === 'Dual Engine Starboard';
      }
    }
	],
	// Engine operating parameters
	'127489': [
    {
      source: 'Temperature',
      node: 'propulsion.port.temperature',
      filter: function (n2k) {
        return n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port';
      }
    },
    {
      source: 'Temperature',
      node: 'propulsion.starboard.temperature',
      filter: function (n2k) {
        return n2k.fields['Engine Instance'] === 'Dual Engine Starboard';
      }
    },
    {
      source: 'Alternator Potential',
      node: 'propulsion.port.alternatorVoltage',
      filter: function (n2k) {
        return n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port';
      }
    },
    {
      source: 'Alternator Potential',
      node: 'propulsion.starboard.alternatorVoltage',
      filter: function (n2k) {
        return n2k.fields['Engine Instance'] === 'Dual Engine Starboard';
      }
    },
    {
      source: 'Fuel Rate',
      node: 'propulsion.port.fuelRate',
      filter: function (n2k) {
        return n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port';
      }
    },
    {
      source: 'Fuel Rate',
      node: 'propulsion.starboard.fuelRate',
      filter: function (n2k) {
        return n2k.fields['Engine Instance'] === 'Dual Engine Starboard';
      }
    }
	],
  //Wind data
  '130306': [
    {
      source: 'Wind Speed',
      node: 'environment.wind.speedApparent',
      filter: function (n2k) {
        return n2k.fields['Reference'] === 'Apparent';
      }
    },
    {
      source: 'Wind Speed',
      node: 'environment.wind.speedTrue',
      filter: function (n2k) {
        return n2k.fields['Reference'] === 'True (boat referenced)';
      }
    },
    {
      source: 'Wind Speed',
      node: 'environment.wind.speedOverGround',
      filter: function (n2k) {
        return n2k.fields['Reference'] === 'True (ground referenced to North)';
      }
    },
    {
      source: 'Wind Angle',
      node: 'environment.wind.angleApparent',
      filter: function (n2k) {
        return n2k.fields['Reference'] === 'Apparent';
      }
    },
    {
      source: 'Wind Angle',
      node: 'environment.wind.angleTrueWater',
      filter: function (n2k) {
        return n2k.fields['Reference'] === 'True (boat referenced)';
      }
    },
    {
      source: 'Wind Angle',
      node: 'environment.wind.directionTrue',
      filter: function (n2k) {
        return n2k.fields['Reference'] === 'True (ground referenced to North)';
      }
    }
  ],
  //Rate of turn
  '127251': [
    {
      source: 'Rate',
      node: 'navigation.rateOfTurn'
    }
  ],
  '127258': [
    {
      source: 'Variation',
      node: 'navigation.position.variation'
    }
  ],
  //Speed
  '128259': [
    {
      source: 'Speed Water Referenced',
      node: 'navigation.speedThroughWater',
      filter: function(n2k) {
        return n2k.fields['Speed Water Referenced']
      }
    },
    {
      source: 'Speed Ground Referenced',
      node: 'navigation.speedOverGround',
      filter: function(n2k) {
        return n2k.fields['Speed Ground Referenced']
      }
    }
  ],
  //Direction data
  '130577': [
    {
      source: 'COG',
      node: 'navigation.courseOverGroundTrue',
      filter: function (n2k) {
        return n2k.fields['COG Reference'] === 'True';
      }
    },
    {
      source: 'SOG',
      node: 'navigation.speedOverGround',
      filter: function (n2k) {
        return n2k.fields['SOG'];
      }
    },
    {
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
        }  else if (n2k.fields['Set Reference'] === 'Magnetic') {
          //speculative, I don't have a real world sample showing 'Magnetic'
          return {
            setTrue: Number(n2k.fields.Set),
            drift: Number(n2k.fields['Drift'])
          };
        }
      }
    }
  ],
  //Set & Drift rapid update
  '129291': [
    {
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
    }
  ],
  '129038': [
    {
      source: 'SOG',
      node: 'navigation.speedOverGround'
    },
    {
      source: 'COG',
      node: 'navigation.courseOverGroundTrue'
    },
    {
      value: function (n2k) {
        return {
          longitude: Number(n2k.fields.Longitude),
          latitude: Number(n2k.fields.Latitude)
        }
      },
      node: 'navigation.position'
    },
    {
      context: getMmsiContext
    }
  ],
  '129039': [
    {
      source: 'SOG',
      node: 'navigation.speedOverGround'
    },
    {
      source: 'COG',
      node: 'navigation.courseOverGroundTrue'
    },
    {
      value: function (n2k) {
        return {
          longitude: Number(n2k.fields.Longitude),
          latitude: Number(n2k.fields.Latitude)
        }
      },
      node: 'navigation.position'
    },
    {
      context: getMmsiContext
    }
  ],
  '129809': [
    {
      source: 'Name',
      node: 'name'
    },
    {
      context: getMmsiContext
    }
  ],
  '129794': [
    {
      source: 'Name',
      node: 'name'
    },
    {
      context: getMmsiContext
    }
  ]
}
