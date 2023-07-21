/*
{"0": "Atmospheric"},
{"1": "Water Pressure"},
{"2": "Steam Pressure"},
{"3": "Compressed Air"},
{"4": "Hydraulic"},
{"5": "Filter"},
{"6": "AltimeterSetting"},
{"7": "Oil"},
{"8": "Fuel"}
*/
module.exports = {
  Atmospheric: {
    path: 'environment.outside.pressure'
  },
  Water: {
    path: 'water.default.pressure',
    pathWithIndex: 'water.<index>.pressure'
  },
  Steam: {
    path: 'steam.default.pressure',
    pathWithIndex: 'steam.<index>.pressure'
  },
  'Compressed Air': {
    path: 'compressedAir.default.pressure',
    pathWithIndex: 'compressedAir.<index>.pressure'
  },
  Hydraulic: {
    path: 'hydraulic.default.pressure',
    pathWithIndex: 'hydraulic.<index>.pressure'
  },
  Filter: {
    path: 'filter.default.pressure',
    pathWithIndex: 'filter.<index>.pressure'
  },
  AltimeterSetting: {
    path: 'altimetersetting.default.pressure',
    pathWithIndex: 'altimetersetting.<index>.pressure'
  },
  Oil: {
    path: 'oil.default.pressure',
    pathWithIndex: 'oil.<index>.pressure'
  },
  Fuel: {
    path: 'fuel.default.pressure',
    pathWithIndex: 'fuel.<index>.pressure'
  }
}
