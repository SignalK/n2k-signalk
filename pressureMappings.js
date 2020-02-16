/*
{"0": "Atmospheric"},
{"1": "Water Pressure"},
{"2": "Steam Pressure"},
{"3": "Compressed Air"},
{"4": "Hydraulic"}
*/
module.exports = {
  'Atmospheric': {
    path: 'environment.outside.pressure'
  },
  'Water': {
    path: 'water.default.pressure',
    pathWithIndex: 'water.<index>.pressure'
  },
  'Steam': {
    path: 'steam.default.pressure',
    pathWithIndex: 'steam.<index>.pressure'
  },
  'Compressed Air': {
    path: 'compressedAir.default.pressure',
    pathWithIndex: 'compressedAir.<index>.pressure'
  },
  'Hydraulic': {
    path: 'hydraulic.default.pressure',
    pathWithIndex: 'hydraulic.<index>.pressure'
  }
}
