const { expect } = require('chai')
const { FromPgn, pgnToActisenseSerialFormat } = require('@canboat/canboatjs')
const { classifyInstance, defaultPrefix } = require('../dist/n2kMapper')

const parser = new FromPgn({ useCamel: true })
const TIMESTAMP = '2026-09-28T12:00:00.000Z'

// Round-trip through canboatjs so fields arrive as the mapper receives them.
function decode (pgn, src, fields) {
  const parsed = parser.parseString(
    pgnToActisenseSerialFormat({
      timestamp: TIMESTAMP,
      prio: 2,
      src,
      dst: 255,
      pgn,
      fields
    })
  )
  parsed.timestamp = TIMESTAMP
  return parsed
}

// The default prefix the frame writes its instance under.
function prefixOf (n2k) {
  const c = classifyInstance(n2k)
  expect(c, `classification of ${n2k.pgn}`).to.not.equal(undefined)
  return defaultPrefix(c.group, c.discriminator, c.instance, n2k.src, n2k.pgn)
}

// A representative frame of every PGN in the instance group table.
const acLine = {
  line: 'Line 1',
  voltage: 230,
  current: 2,
  frequency: 50
}

const FRAMES = [
  [
    127488,
    {
      instance: 'Single Engine or Dual Engine Port',
      speed: 3000,
      boostPressure: 100000,
      tiltTrim: 10
    }
  ],
  [
    127489,
    {
      instance: 'Dual Engine Starboard',
      temperature: 350,
      oilPressure: 300000,
      discreteStatus1: ['Low Oil Pressure'],
      discreteStatus2: ['Warning Level 1']
    }
  ],
  [
    127493,
    {
      instance: 2,
      transmissionGear: 'Forward',
      oilPressure: 100000,
      oilTemperature: 320,
      discreteStatus1: ['Over Temperature']
    }
  ],
  [127497, { tripFuelUsed: 100, fuelRateAverage: 5 }],
  [127503, { instance: 1, numberOfLines: 1, list: [acLine] }],
  [127504, { instance: 2, numberOfLines: 1, list: [acLine] }],
  [127505, { instance: 1, type: 'Fuel', level: 50, capacity: 200 }],
  [127506, { instance: 3, stateOfCharge: 80, stateOfHealth: 90 }],
  [127507, { instance: 0, batteryInstance: 0, operatingState: 'Bulk' }],
  [127508, { instance: 3, voltage: 12.5, current: 1.5, temperature: 300 }],
  [127509, { instance: 0, acInstance: 0, dcInstance: 0, inverterEnable: 'On' }],
  [127510, { instance: 1, batteryInstance: 0, chargeCurrentLimit: 20 }],
  [127511, { instance: 0, batteryInstance: 0, inverterEnableDisable: 'On' }],
  [127513, { instance: 3, capacity: 100, peukertExponent: 1.2 }],
  [127744, { connectionNumber: 0, acRmsCurrent: 3, power: 100 }],
  [127745, { connectionNumber: 1, acRmsCurrent: 3, power: 100 }],
  [127746, { connectionNumber: 2, acRmsCurrent: 3, power: 100 }],
  [127750, { connectionNumber: 1, operatingState: 'Invert' }],
  [127751, { connectionNumber: 0, dcVoltage: 13.2, dcCurrent: 4 }],
  [
    130312,
    { instance: 0, source: 'Engine Room Temperature', actualTemperature: 330 }
  ],
  [
    130312,
    { instance: 4, source: 'Shaft Seal Temperature', actualTemperature: 330 }
  ],
  [130312, { instance: 2, source: 'Inside Temperature', actualTemperature: 1 }],
  [130313, { instance: 1, source: 'Inside', actualHumidity: 40 }],
  [130313, { instance: 0, source: 'Outside', actualHumidity: 60 }],
  [130314, { instance: 0, source: 'Oil', pressure: 300000 }],
  [130314, { instance: 0, source: 'Atmospheric', pressure: 101300 }],
  [
    130316,
    { instance: 1, source: 'Exhaust Gas Temperature', temperature: 700 }
  ],
  [130316, { instance: 4, source: 'Shaft Seal Temperature', temperature: 330 }]
]

module.exports = { decode, prefixOf, FRAMES }
