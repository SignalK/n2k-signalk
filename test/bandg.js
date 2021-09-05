const chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

const N2kMapper = require('../n2kMapper').N2kMapper
const toNested = require('./testMapper').toNested

describe('B&G PGNs work', function () {
  const n2kMapper = new N2kMapper()

  n2kMapper.toDelta({"canId":486481152,"prio":7,"src":0,"dst":255,"pgn":65309,"time":"1628312401044;A;06:25:52.641","input":["1628312401044;A;06:25:52.641 R 1CFF1D00 13 99 00 4E 0A FF FF 7F"],"fields":{"Manufacturer Code":"Navico","Industry Code":"Marine Industry","Status":0,"Battery Status":78,"Battery Charge Status":10,"Reserved2":8388607},"description":"Navico: Wireless Battery Status","timestamp":"2021-09-05T14:43:06.818Z"})


  it('65309 WS320 Battery status', function () {
    var tree = toNested(
      JSON.parse(
        '{"canId":486481152,"prio":7,"src":0,"dst":255,"pgn":65309,"time":"1628312401044;A;06:25:52.641","input":["1628312401044;A;06:25:52.641 R 1CFF1D00 13 99 00 4E 0A FF FF 7F"],"fields":{"Manufacturer Code":"Navico","Industry Code":"Marine Industry","Status":0,"Battery Status":78,"Battery Charge Status":10,"Reserved2":8388607},"description":"Navico: Wireless Battery Status","timestamp":"2021-09-05T14:43:06.818Z"}',
      ),
      n2kMapper.state
    )

    tree.should.have.nested.property(
      'instruments.wireless.0.batteryStatus.value',
      78
    )
    tree.should.have.nested.property(
      'instruments.wireless.0.batteryChargeStatus.value',
      10
    )
    tree.should.have.nested.property(
      'instruments.wireless.0.status.value',
      0
    )
  })
  n2kMapper.toDelta({"canId":486481920,"prio":7,"src":0,"dst":255,"pgn":65312,"time":"1628312404394;A;06:25:56.008","input":["1628312404394;A;06:25:56.008 R 1CFF2000 13 99 00 2D 7F FF FF FF"],"fields":{"Manufacturer Code":"Navico","Industry Code":"Marine Industry","Unknown":0,"Signal Strength":45,"Reserved2":16777087},"description":"Navico: Wireless Signal Status","timestamp":"2021-09-05T14:43:06.823Z"})

  it('65312 WS320 Signal status', function () {
    var tree = toNested(
      JSON.parse(
        '{"canId":486481920,"prio":7,"src":0,"dst":255,"pgn":65312,"time":"1628312404394;A;06:25:56.008","input":["1628312404394;A;06:25:56.008 R 1CFF2000 13 99 00 2D 7F FF FF FF"],"fields":{"Manufacturer Code":"Navico","Industry Code":"Marine Industry","Unknown":0,"Signal Strength":45,"Reserved2":16777087},"description":"Navico: Wireless Signal Status","timestamp":"2021-09-05T14:43:06.823Z"}',
      ),
      n2kMapper.state
    )

    tree.should.have.nested.property(
      'instruments.wireless.0.signalStrength.value',
      45
    )
  })


})
