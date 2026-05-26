const getMmsiContext = require('../mmsi-context').getMmsiContext
const getFromStarboard = require('../aisFromStarboard')
const getShipType = require('../aisShipTypeMapping')

module.exports = [
  {
    node: 'sensors.ais.class',
    value: function (n2k) {
      return 'A'
    }
  },
  {
    node: '',
    filter: n2k => n2k.fields.name,
    value: function (n2k) {
      return {
        name: n2k.fields.name
      }
    }
  },
  {
    node: 'navigation.destination.commonName',
    value: n2k => n2k.fields.destination
  },
  {
    node: 'navigation.destination.eta',
    value: function (n2k) {
      if (typeof n2k.fields.etaDate === 'string') {
        const datePart = n2k.fields.etaDate.replace(/\./g, '-')
        const timePart = String(n2k.fields.etaTime)
        const timeMatch = timePart.match(/^(\d+):(\d{2}):(\d{2})(\.\d+)?$/)
        if (!timeMatch) {
          const parsedDate = new Date(datePart + 'T00:00:00Z')
          if (!Number.isFinite(parsedDate.getTime())) {
            return undefined
          }
          return parsedDate.toISOString()
        }

        const rawHours = Number(timeMatch[1])
        const rawMinutes = Number(timeMatch[2])
        const rawSeconds = Number(timeMatch[3])
        const fractional = timeMatch[4] ? Number(timeMatch[4]) : 0

        const hours = rawHours > 23 ? 0 : rawHours
        const minutes = rawMinutes > 59 ? 0 : rawMinutes
        const seconds = rawSeconds > 59 ? 0 : rawSeconds
        const totalSeconds = hours * 3600 + minutes * 60 + seconds + fractional

        const parsedDate = new Date(datePart + 'T00:00:00Z')
        if (!Number.isFinite(parsedDate.getTime())) {
          return undefined
        }
        return new Date(
          parsedDate.getTime() + Math.round(totalSeconds * 1000)
        ).toISOString()
      }
      const etaDate = Number(n2k.fields.etaDate)
      const etaTime = Number(n2k.fields.etaTime)
      if (
        !Number.isFinite(etaDate) ||
        !Number.isFinite(etaTime) ||
        etaDate <= 0
      ) {
        return undefined
      }
      const etaMs = Date.UTC(1970, 0, 1) + etaDate * 86400000 + etaTime * 1000
      return new Date(etaMs).toISOString()
    }
  },
  {
    node: 'design.draft',
    filter: function (n2k) {
      return n2k.fields.draft
    },
    value: function (n2k) {
      return { maximum: n2k.fields.draft }
    }
  },
  {
    node: 'design.length',
    value: function (n2k) {
      return { overall: Number(n2k.fields.length) }
    },
    filter: function (n2k) {
      return n2k.fields.length
    }
  },
  {
    node: 'design.aisShipType',
    value: function (n2k) {
      return getShipType(n2k.fields.typeOfShip)
    },
    filter: function (n2k) {
      return n2k.fields.typeOfShip
    }
  },
  {
    node: '',
    filter: n2k => n2k.fields.callsign,
    value: n2k => ({
      communication: {
        callsignVhf: n2k.fields.callsign
      }
    })
  },
  {
    node: 'design.beam',
    source: 'beam'
  },
  {
    node: 'sensors.ais.fromBow',
    source: 'positionReferenceFromBow'
  },
  {
    node: 'sensors.ais.fromCenter',
    value: getFromStarboard,
    filter: function (n2k) {
      return n2k.fields.positionReferenceFromStarboard && n2k.fields.beam
    }
  },
  {
    node: '',
    filter: n2k => n2k.fields.userId,
    value: function (n2k) {
      return {
        mmsi: n2k.fields.userId.toString()
      }
    }
  },
  {
    node: '',
    value: function (n2k) {
      return {
        registrations: {
          imo: `IMO ${n2k.fields.imoNumber}`
        }
      }
    },
    filter: function (n2k) {
      return n2k.fields.imoNumber && n2k.fields.imoNumber != 0
    }
  },
  {
    context: getMmsiContext
  }
]
