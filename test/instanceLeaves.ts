import chai from 'chai'
chai.should()

import { N2kMapper, instanceGroups } from '../dist/n2kMapper'
import { groupLeaves } from '../dist/instanceGroups'
import { decode, FRAMES, Fields, Frame } from './instanceFrames'
const pgnMappings = require('../dist/pgns')

const PREFIX = 'x.y'

const line = (n: number) => ({
  line: `Line ${n}`,
  voltage: 230,
  current: 2,
  frequency: 50,
  breakerSize: 16,
  realPower: 400,
  reactivePower: 20,
  powerFactor: 0.9
})
const lines = (extra: object) => ({
  instance: 0,
  numberOfLines: 3,
  list: [1, 2, 3].map((n) => ({ ...line(n), ...extra }))
})

// A frame of every multi-leaf PGN with every field its mapping reads.
const FULL_FRAMES: Frame[] = [
  [127488, { instance: 0, speed: 50, boostPressure: 100000, tiltTrim: 0.1 }],
  [
    127489,
    {
      instance: 0,
      oilPressure: 300000,
      oilTemperature: 350,
      temperature: 350,
      alternatorPotential: 14,
      fuelRate: 0.000001,
      totalEngineHours: 3600,
      coolantPressure: 100000,
      fuelPressure: 300000,
      discreteStatus1: [],
      discreteStatus2: [],
      engineLoad: 0.5,
      engineTorque: 0.5
    }
  ],
  [
    127493,
    {
      instance: 0,
      transmissionGear: 'Forward',
      oilPressure: 100000,
      oilTemperature: 320,
      discreteStatus1: []
    }
  ],
  [
    127497,
    {
      instance: 0,
      tripFuelUsed: 0.1,
      fuelRateAverage: 0.000001,
      fuelRateEconomy: 0.000001,
      instantaneousFuelEconomy: 0.000001
    }
  ],
  [127503, lines({ acceptability: 'Good' })],
  [127504, lines({ waveform: 'Sine wave' })],
  [127505, { instance: 0, type: 'Fuel', level: 0.5, capacity: 0.2 }],
  [
    127506,
    {
      instance: 0,
      dcType: 'Battery',
      stateOfCharge: 0.8,
      stateOfHealth: 0.9,
      timeRemaining: 3600
    }
  ],
  [
    127507,
    {
      instance: 0,
      batteryInstance: 0,
      operatingState: 'Bulk',
      chargeMode: 'Standalone',
      enabled: 'On',
      equalizationPending: 'Off',
      equalizationTimeRemaining: 60
    }
  ],
  [127508, { instance: 0, voltage: 12.5, current: 1.5, temperature: 300 }],
  [
    127509,
    {
      instance: 0,
      acInstance: 0,
      dcInstance: 0,
      operatingState: 'Invert',
      inverterEnable: 'On'
    }
  ],
  [
    127510,
    {
      instance: 0,
      batteryInstance: 0,
      chargerEnableDisable: 'On',
      chargeCurrentLimit: 0.2,
      chargingAlgorithm: 'Trickle',
      chargerMode: 'Standalone',
      estimatedTemperature: 'Warm',
      equalizeOneTimeEnableDisable: 'Off',
      overChargeEnableDisable: 'Off',
      equalizeTime: 60
    }
  ],
  [
    127511,
    {
      instance: 0,
      acInstance: 0,
      dcInstance: 0,
      inverterEnableDisable: 'On',
      inverterMode: 'Standalone',
      loadSenseEnableDisable: 'On',
      loadSensePowerThreshold: 20,
      loadSenseInterval: 1
    }
  ],
  [
    127513,
    {
      instance: 0,
      batteryType: 'Gel',
      supportsEqualization: 'Yes',
      nominalVoltage: '12V',
      chemistry: 'Li',
      capacity: 360000,
      temperatureCoefficient: 0.5,
      peukertExponent: 1.2,
      chargeEfficiencyFactor: 0.9
    }
  ],
  ...[127744, 127745, 127746].map((pgn): Frame => [
    pgn,
    { connectionNumber: 0, acRmsCurrent: 3, power: 100 }
  ]),
  ...[127747, 127748, 127749].map((pgn): Frame => [
    pgn,
    {
      connectionNumber: 0,
      acVoltageLineToNeutral: 230,
      acVoltageLineToLine: 400,
      frequency: 50
    }
  ]),
  [
    127750,
    {
      connectionNumber: 0,
      operatingState: 'Invert',
      temperatureState: 'Good',
      overloadState: 'Good',
      lowDcVoltageState: 'Good',
      rippleState: 'Good'
    }
  ],
  [127751, { connectionNumber: 0, dcVoltage: 13.2, dcCurrent: 4 }]
]

// The default paths of the PGN's mapping entries a frame has not reached:
// a frame missing a field the entry reads leaves its path out of the lists
// compared below. 127503 and 127504 map every line field they are given.
function unreached(pgn: number, fields: Fields): string[] {
  const n2k = decode(pgn, 34, fields)
  const paths = new Set(
    new N2kMapper().toDelta(n2k)!.updates[0].values.map((v: any) => v.path)
  )
  return pgnMappings[pgn]
    .filter((entry: any) => typeof entry.node === 'function')
    .map((entry: any) => entry.node(n2k))
    .filter((path: string) => !paths.has(path))
}

// The paths a frame writes under the prefix, relative to it, and whether it
// writes notifications.
function written(pgn: number, fields: Fields) {
  const mapper = new N2kMapper({ instancePrefixResolver: () => PREFIX })
  const paths: string[] = mapper
    .toDelta(decode(pgn, 34, fields))!
    .updates[0].values.map((v: any) => v.path)
  const leaves = paths
    .filter((path) => !path.startsWith('notifications.'))
    .map((path) => (path === PREFIX ? '' : path.slice(PREFIX.length + 1)))
  return { leaves, notifies: leaves.length < paths.length }
}

describe('instance group leaves', function () {
  instanceGroups.forEach((group) => {
    it(`lists the paths the ${group.id} group writes`, function () {
      const frames = (group.singleLeaf ? FRAMES : FULL_FRAMES).filter((frame) =>
        group.pgns.includes(frame[0])
      )
      frames
        .map((frame) => frame[0])
        .should.include.members(group.pgns, 'a frame of every PGN')
      const leaves = new Set<string>()
      for (const frame of frames) {
        const pgn = frame[0]
        unreached(pgn, frame[1]).should.deep.equal([], `${pgn} unreached`)
        const result = written(pgn, frame[1])
        if (group.id !== 'engine') {
          result.notifies.should.equal(false, `${pgn} writes notifications`)
        }
        result.leaves.forEach((leaf) => leaves.add(leaf))
      }
      ;[...leaves].should.have.members([...groupLeaves(group.id)])
    })
  })
})
