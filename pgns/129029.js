module.exports = [
  {
    value: function (n2k) {
      return {
        longitude: Number(n2k.fields.longitude),
        latitude: Number(n2k.fields.latitude)
      }
    },
    filter: n2k =>
      typeof n2k.fields.longitude !== 'undefined' &&
      typeof n2k.fields.latitude !== 'undefined',
    node: 'navigation.position'
  },
  {
    value: function (n2k) {
      return `${n2k.fields.date.replace(/\./g, '-')}T${n2k.fields.time}Z`
    },
    filter: n2k =>
      typeof n2k.fields.date !== 'undefined' &&
      typeof n2k.fields.time !== 'undefined',
    node: 'navigation.datetime'
  },
  {
    source: 'altitude',
    node: 'navigation.gnss.antennaAltitude'
  },
  {
    source: 'numberOfSvs',
    node: 'navigation.gnss.satellites'
  },
  {
    source: 'hdop',
    node: 'navigation.gnss.horizontalDilution'
  },
  {
    source: 'pdop',
    node: 'navigation.gnss.positionDilution'
  },
  {
    source: 'geoidalSeparation',
    node: 'navigation.gnss.geoidalSeparation'
  },
  {
    source: 'ageOfDgnssCorrections',
    node: 'navigation.gnss.differentialAge'
  },
  {
    source: 'referenceStationId',
    node: 'navigation.gnss.differentialReference'
  },
  {
    node: 'navigation.gnss.type',
    value: function (n2k) {
      var type = n2k.fields.gnssType
      var mapped = typeMap[type]
      return mapped || type
    }
  },
  {
    node: 'navigation.gnss.methodQuality',
    value: function (n2k) {
      var method = n2k.fields.method
      var mapped = methodQualityMap[method]
      return mapped || method
    }
  },
  {
    node: 'navigation.gnss.integrity',
    value: function (n2k) {
      var integrity = n2k.fields.integrity
      var mapped = integrityMap[integrity]
      return mapped || integrity
    }
  }
]

var typeMap = {
  'GPS+GLONASS': 'Combined GPS/GLONASS',
  integrated: 'Integrated navigation system',
  surveyed: 'Surveyed'
}

var methodQualityMap = {
  'no GNSS': 'no GPS',
  'GNSS fix': 'GNSS Fix',
  'RTK Fixed Integer': 'RTK fixed integer',
  'Simulate mode': 'Simulator mode'
}

var integrityMap = {
  'No integrity checking': 'no Integrity checking'
}
