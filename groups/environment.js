
exports.mappings = {
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
