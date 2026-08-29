const chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

const testMapper = require('./testMapper')

const batteryStatus = {
  timestamp: '2021-09-05T14:43:06.818Z',
  prio: 7,
  src: 42,
  dst: 255,
  pgn: 65309,
  fields: {
    'Manufacturer Code': 'Navico',
    'Industry Code': 'Marine Industry',
    Status: 0,
    'Battery Status': 78,
    'Battery Charge Status': 10
  }
}

const signalStatus = {
  timestamp: '2021-09-05T14:43:06.823Z',
  prio: 7,
  src: 42,
  dst: 255,
  pgn: 65312,
  fields: {
    'Manufacturer Code': 'Navico',
    'Industry Code': 'Marine Industry',
    Unknown: 0,
    'Signal Strength': 45
  }
}

describe('Navico wireless sensor status', function () {
  it('65309 reports battery state as ratios', function () {
    const tree = testMapper.toNested(structuredClone(batteryStatus))

    tree.should.have.nested.property('sensors.wind.batteryStatus.value', 0.78)
    tree.should.have.nested.property(
      'sensors.wind.batteryChargeStatus.value',
      0.1
    )
    tree.should.have.nested.property('sensors.wind.status.value', 0)
  })

  it('65312 reports signal strength as a ratio', function () {
    const tree = testMapper.toNested(structuredClone(signalStatus))

    tree.should.have.nested.property('sensors.wind.signalStrength.value', 0.45)
  })

  // canboatjs hands the mapper camelCase field ids, so these fixtures skip the
  // actisense round trip: the point is that the mapping itself refuses a
  // matching PGN number carrying another manufacturer's payload.
  const parsed = manufacturerCode => ({
    timestamp: '2021-09-05T14:43:06.818Z',
    prio: 7,
    src: 42,
    dst: 255,
    pgn: 65309,
    fields: {
      manufacturerCode,
      industryCode: 'Marine Industry',
      status: 0,
      batteryStatus: 78,
      batteryChargeStatus: 10
    }
  })

  it('maps 65309 when the manufacturer is Navico', function () {
    const values = testMapper.toDelta(parsed('Navico'), {}).updates[0].values

    values.should.have.lengthOf(3)
  })

  it('ignores 65309 from another manufacturer', function () {
    const values = testMapper.toDelta(parsed('Raymarine'), {}).updates[0].values

    values.should.be.empty
  })
})
