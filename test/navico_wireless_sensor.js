const chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

const { FromPgn } = require('@canboat/canboatjs')
const testMapper = require('./testMapper')

// A B&G WS320 wireless wind sensor at address 3, from canboat's
// samples/ws320.raw.
const BATTERY_STATUS =
  '2018-02-14T15:55:07.952Z,7,65309,3,255,8,13,99,00,4c,00,ff,ff,7f'
const SIGNAL_STATUS =
  '2018-02-14T15:55:08.147Z,7,65312,3,255,8,13,99,00,15,7f,ff,ff,ff'

const parse = (line) => new FromPgn({ useCamel: true }).parseString(line)

describe('Navico wireless sensor status', function () {
  it('65309 reports battery state as ratios', function () {
    const tree = testMapper.n2kToNested(parse(BATTERY_STATUS))

    tree.should.have.nested.property('sensors.wind.batteryStatus.value', 0.76)
    tree.should.have.nested.property(
      'sensors.wind.batteryChargeStatus.value',
      0
    )
    tree.should.have.nested.property('sensors.wind.status.value', 0)
  })

  it('65312 reports signal strength as a ratio', function () {
    const tree = testMapper.n2kToNested(parse(SIGNAL_STATUS))

    tree.should.have.nested.property('sensors.wind.signalStrength.value', 0.21)
  })

  // The mapping keys on the manufacturer as well as the PGN number, so the
  // same proprietary PGN from another manufacturer must not map.
  it('maps 65309 when the manufacturer is Navico', function () {
    const values = testMapper.toDelta(parse(BATTERY_STATUS), {}).updates[0]
      .values

    values.should.have.lengthOf(3)
  })

  it('ignores 65309 from another manufacturer', function () {
    const pgn = parse(BATTERY_STATUS)
    pgn.fields.manufacturerCode = 'Raymarine'
    const values = testMapper.toDelta(pgn, {}).updates[0].values

    values.should.be.empty
  })
})
