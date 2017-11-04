const schema = require('@signalk/signalk-schema')

module.exports = function (type) {
  const num = mapping[type]
  var name
  if (typeof num !== 'undefined' && (name = schema.getAISShipTypeName(num))) {
    return {
      'id': num,
      'name': name
    }
  } else {
    return null
  }
}

const mapping = {
  unavailable: 0,
  'Wing In Ground': 20,
  'Wing In Ground (no other information)': 29,
  Fishing: 30,
  Towing: 31,
  'Towing exceeds 200m or wider than 25m': 32,
  'Engaged in dredging or underwater operations': 33,
  'Engaged in diving operations': 34,
  'Engaged in military operations': 35,
  Sailing: 36,
  Pleasure: 37,
  'High speed craft': 40,
  'High speed craft carrying dangerous goods': 41,
  'High speed craft hazard cat B': 42,
  'High speed craft hazard cat C': 43,
  'High speed craft hazard cat D': 44,
  'High speed craft (no additional information)': 49,
  'Pilot vessel': 50,
  'SAR': 51,
  Tug: 52,
  'Port tender': 53,
  'Anti-pollution': 54,
  'Law enforcement': 55,
  Spare: 56,
  'Spare #2': 57,
  Medical: 58,
  'RR Resolution No.1': 59,
  'Passenger ship': 60,
  'Passenger ship (no additional information)': 69,
  'Cargo ship': 70,
  'Cargo ship carrying dangerous goods': 71,
  'Cargo ship hazard cat B': 72,
  'Cargo ship hazard cat C': 73,
  'Cargo ship hazard cat D': 74,
  'Cargo ship (no additional information)': 79,
  Tanker: 80,
  'Tanker carrying dangerous goods': 81,
  'Tanker hazard cat B': 82,
  'Tanker hazard cat C': 83,
  'Tanker hazard cat D': 84,
  'Tanker (no additional information)': 89,
  Other: 90,
  'Other carrying dangerous goods': 91,
  'Other hazard cat B': 92,
  'Other hazard cat C': 93,
  'Other hazard cat D': 94,
  'Other (no additional information)': 99
}
