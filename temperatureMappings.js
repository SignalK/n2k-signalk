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
module.exports = {
  'Sea Temperature': {
    path: 'environment.water.temperature'
  },
  'Outside Temperature': {
    path: 'environment.outside.temperature'
  },
  'Inside Temperature': {
    path: 'environment.inside.temperature'
  },
  'Engine Room Temperature': {
    path: 'environment.inside.engineRoom.temperature'
  },
  'Main Cabin Temperature': {
    path: 'environment.inside.mainCabin.temperature'
  },
  'Live Well Temperature': {
    // FIXME: Does not exist in SignalK 1.0.4
    //path: 'environment.water.liveWell.temperature'
  },
  'Bait Well Temperature': {
    // FIXME: Does not exist in SignalK 1.0.4
    //path: 'environment.water.baitWell.temperature'
  },
  'Refrigerator Temperature': {
    path: 'environment.inside.refrigerator.temperature'
  },
  'Heating System Temperature': {
    path: 'environment.inside.heating.temperature'
  },
  'Dew Point Temperature': {
    path: 'environment.outside.dewPointTemperature'
  },
  'Apparent Wind Chill Temperature': {
    path: 'environment.outside.apparentWindChillTemperature'
  },
  'Theoretical Wind Chill Temperature': {
    path: 'environment.outside.theoreticalWindChillTemperature'
  },
  'Heat Index Temperature': {
    path: 'environment.outside.heatIndexTemperature'
  },
  'Heat Index Temperature': {
    path: 'environment.outside.heatIndexTemperature'
  },
  'Freezer Temperature': {
    path: 'environment.inside.freezer.temperature'
  },
  'Exhaust Gas Temperature': {
    path: 'propulsion.exhaust.temperature'
  }
}
