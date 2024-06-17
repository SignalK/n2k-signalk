const debug = require('debug')('n2k-signalk-129029')

function pad2 (number) {
  return number < 10 ? '0' + number : number
}

module.exports = [
  {
    value: function (n2k) {
      return {
        longitude: Number(n2k.fields.Longitude),
        latitude: Number(n2k.fields.Latitude)
      }
    },
    filter: n2k =>
      typeof n2k.fields.Longitude !== 'undefined' &&
      typeof n2k.fields.Latitude !== 'undefined',
    node: 'navigation.position'
  },
  {
    value: function (n2k) {
      // Check if the year is less than 2024
      let [year, month, day] = n2k.fields.Date.split('.').map(Number)
      if (year < 2020) {
        // Create a date object from the extracted values
        let date = new Date(Date.UTC(year, month - 1, day))

        // Add 7168 days to the date
        date.setDate(date.getDate() + 7168)

        // Update the value with the new date
        n2k.fields.Date = `${date.getUTCFullYear()}.${pad2(
          date.getUTCMonth() + 1
        )}.${pad2(date.getUTCDate())}`
      }

      return `${n2k.fields.Date.replace(/\./g, '-')}T${n2k.fields.Time}Z`
    },
    filter: n2k =>
      typeof n2k.fields.Date !== 'undefined' &&
      typeof n2k.fields.Time !== 'undefined',
    node: 'navigation.datetime'
  },
  {
    source: 'Altitude',
    node: 'navigation.gnss.antennaAltitude'
  },
  {
    source: 'Number of SVs',
    node: 'navigation.gnss.satellites'
  },
  {
    source: 'HDOP',
    node: 'navigation.gnss.horizontalDilution'
  },
  {
    source: 'PDOP',
    node: 'navigation.gnss.positionDilution'
  },
  {
    source: 'Geoidal Separation',
    node: 'navigation.gnss.geoidalSeparation'
  },
  {
    source: 'Age of DGNSS Corrections',
    node: 'navigation.gnss.differentialAge'
  },
  {
    source: 'Reference Station ID',
    node: 'navigation.gnss.differentialReference'
  },
  {
    node: 'navigation.gnss.type',
    value: function (n2k) {
      var type = n2k.fields['GNSS type']
      var mapped = typeMap[type]
      return mapped || type
    }
  },
  {
    node: 'navigation.gnss.methodQuality',
    value: function (n2k) {
      var method = n2k.fields['Method']
      var mapped = methodQualityMap[method]
      return mapped || method
    }
  },
  {
    node: 'navigation.gnss.integrity',
    value: function (n2k) {
      var integrity = n2k.fields['Integrity']
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
