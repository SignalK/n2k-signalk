const schema = require('@signalk/signalk-schema')

module.exports = function (type) {
  const num = mapping[type]
  var name
  if (typeof num !== 'undefined' && (name = schema.getAISShipTypeName(num))) {
    return {
      id: num,
      name: name
    }
  } else {
    return null
  }
}

const mapping = {
  Unavailable: 0,
  'Wing In Ground': 20,
  'Wing In Ground (hazard cat X)': 21,
  'Wing In Ground (hazard cat Y)': 22,
  'Wing In Ground (hazard cat Z)': 23,
  'Wing In Ground (hazard cat OS)': 24,
  'Wing In Ground (no additional information)': 29,
  Fishing: 30,
  Towing: 31,
  'Towing exceeds 200m or wider than 25m': 32,
  'Engaged in dredging or underwater operations': 33,
  'Engaged in diving operations': 34,
  'Engaged in military operations': 35,
  Sailing: 36,
  Pleasure: 37,
  'High speed craft': 40,
  'High speed craft (hazard cat X)': 41,
  'High speed craft (hazard cat Y)': 42,
  'High speed craft (hazard cat Z)': 43,
  'High speed craft (hazard cat OS)': 44,
  'High speed craft (no additional information)': 49,
  'Pilot vessel': 50,
  SAR: 51,
  Tug: 52,
  'Port tender': 53,
  'Anti-pollution': 54,
  'Law enforcement': 55,
  Spare: 56,
  'Spare #2': 57,
  Medical: 58,
  'Ships and aircraft of States not parties to an armed conflict': 59,
  'Passenger ship': 60,
  'Passenger ship (hazard cat X)': 61,
  'Passenger ship (hazard cat Y)': 62,
  'Passenger ship (hazard cat Z)': 63,
  'Passenger ship (hazard cat OS)': 64,
  'Passenger ship (no additional information)': 69,
  'Cargo ship': 70,
  'Cargo ship (hazard cat X)': 71,
  'Cargo ship (hazard cat Y)': 72,
  'Cargo ship (hazard cat Z)': 73,
  'Cargo ship (hazard cat OS)': 74,
  'Cargo ship (no additional information)': 79,
  Tanker: 80,
  'Tanker (hazard cat X)': 81,
  'Tanker (hazard cat Y)': 82,
  'Tanker (hazard cat Z)': 83,
  'Tanker (hazard cat OS)': 84,
  'Tanker (no additional information)': 89,
  Other: 90,
  'Other (hazard cat X)': 91,
  'Other (hazard cat Y)': 92,
  'Other (hazard cat Z)': 93,
  'Other (hazard cat OS)': 94,
  'Other (no additional information)': 99
}
