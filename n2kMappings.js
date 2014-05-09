exports.mappings =
{
  //Water Depth
  '128267': [
    {
      source: 'Depth',
      node: 'environmental.depth'
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
        return [Number(n2k.fields.Longitude), Number(n2k.fields.Latitude)];
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
      node: 'environmental.windSpeedApparent',
      filter: function (n2k) {
        return n2k.fields['Reference'] === 'Apparent';
      }
    },
    {
      source: 'Wind Speed',
      node: 'environmental.windSpeedTrueBoat',
      filter: function (n2k) {
        return n2k.fields['Reference'] === 'True (boat referenced)';
      }
    },
    {
      source: 'Wind Speed',
      node: 'environmental.windSpeedTrueGround',
      filter: function (n2k) {
        return n2k.fields['Reference'] === 'True (ground referenced to North)';
      }
    },
    {
      source: 'Wind Angle',
      node: 'environmental.windAngleApparent',
      filter: function (n2k) {
        return n2k.fields['Reference'] === 'Apparent';
      }
    },
    {
      source: 'Wind Angle',
      node: 'environmental.windAngleTrueBoat',
      filter: function (n2k) {
        return n2k.fields['Reference'] === 'True (boat referenced)';
      }
    },
    {
      source: 'Wind Angle',
      node: 'environmental.windAngleTrueGround',
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
  //Direction data
  '130577': [
    {
      source: 'Set',
      node: 'navigation.set'
    },
    {
      source: 'Drift',
      node: 'navigation.drift'
    }
  ]
}

