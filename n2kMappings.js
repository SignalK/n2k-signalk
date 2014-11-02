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
      node: 'environment.depth'
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
      node: 'vessel.rudder',
      filter: function (n2k) {
        return typeof n2k.fields['Position'] != 'undefined'
      }
    }
  ],
  //Attitude
  '127257': [
    {
      source: 'Yaw',
      node: 'navigation.yaw'
    },
    {
      source: 'Pitch',
      node: 'navigation.pitch'
    },
    {
      source: 'Roll',
      node: 'navigation.roll'
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
      node: 'environment.wind.speedOverWater',
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
      node: 'environment.wind.angleTrue',
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
      node: 'navigation.speedThroughWater'
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
      source: 'Set',
      node: 'navigation.current.setTrue',
      filter: function (n2k) {
        //assume that Set is same reference as COG
        return n2k.fields['Set'] && n2k.fields['COG Reference'];
      }
    },
    {
      source: 'Drift',
      node: 'navigation.current.drift',
      filter: function (n2k) {
        return n2k.fields['Drift'];
      }
    }
  ],
  //Set & Drift rapid update
  '129291': [
  {
    source: 'Set',
    node: 'navigation.current.setTrue',
    filter: function (n2k) {
      return n2k.fields['Set'] && n2k.fields['Set Reference'] === 'True';
    }
  },
  {
    source: 'Drift',
    node: 'navigation.current.drift',
    filter: function (n2k) {
      return n2k.fields['Drift'];
    }
  }
]
}

