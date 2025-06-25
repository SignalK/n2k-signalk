const chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

const N2kMapper = require('../n2kMapper').N2kMapper
const toNested = require('./testMapper').toNested

describe('Maretron AC PGNs work', function () {
  const n2kMapper = new N2kMapper()

  n2kMapper.toDelta({
    prio: 6,
    pgn: 60928,
    dst: 255,
    src: 192,
    timestamp: '2019-05-31T11:46:58.594Z',
    fields: {
      uniqueNumber: '76223',
      deviceInstanceLower: 0,
      deviceInstanceUpper: 1,
      deviceFunction: 130,
      Reserved1: '0',
      systemInstance: 0,
      industryGroup: 'Marine',
      Reserved2: '1'
    },
    description: 'ISO Address Claim'
  })

  n2kMapper.toDelta({
    prio: 6,
    pgn: 60928,
    dst: 255,
    src: 193,
    timestamp: '2019-05-31T11:46:58.594Z',
    fields: {
      uniqueNumber: '76223',
      deviceInstanceLower: 0,
      deviceInstanceUpper: 2,
      deviceFunction: 130,
      Reserved1: '0',
      systemInstance: 0,
      industryGroup: 'Marine',
      Reserved2: '1'
    },
    description: 'ISO Address Claim'
  })

  n2kMapper.toDelta({
    prio: 6,
    pgn: 60928,
    dst: 255,
    src: 194,
    timestamp: '2019-05-31T11:46:58.594Z',
    fields: {
      uniqueNumber: '76223',
      deviceInstanceLower: 0,
      deviceInstanceUpper: 3,
      deviceFunction: 130,
      Reserved1: '0',
      systemInstance: 0,
      industryGroup: 'Marine',
      Reserved2: '1'
    },
    description: 'ISO Address Claim'
  })

  it('65005 Utility Total AC Energy', function () {
    var tree = toNested(
      JSON.parse(
        '{"canId":217968066,"prio":3,"src":194,"dst":255,"pgn":65005,"direction":"R","time":"18:58:12.730","fields":{"Total Energy Export":0,"Total Energy Import":0},"description":"Utility Total AC Energy","timestamp":"2020-03-28T18:58:13.092Z"}'
      ),
      n2kMapper.state
    )

    tree.should.have.nested.property(
      'electrical.ac.24.total.energyExport.value',
      0
    )
    tree.should.have.nested.property(
      'electrical.ac.24.total.energyImport.value',
      0
    )
  })

  it('65012 Utility Phase A AC Reactive Power', function () {
    var tree = toNested(
      JSON.parse(
        '{"canId":217969856,"prio":3,"src":192,"dst":255,"pgn":65012,"direction":"R","time":"18:58:11.989","fields":{"Reactive Power":859,"Power Factor Lagging":"Lagging"},"description":"Utility Phase A AC Reactive Power","timestamp":"2020-03-28T18:58:12.480Z"}'
      ),
      n2kMapper.state
    )

    tree.should.have.nested.property(
      'electrical.ac.8.phase.A.reactivePower.value',
      859
    )
    /*
    tree.should.have.nested.property(
      'electrical.ac.8.phase.A.powerFactor.value',
      0.927734375
      )
    */
    tree.should.have.nested.property(
      'electrical.ac.8.phase.A.powerFactorLagging.value',
      'lagging'
    )

    //tree.should.be.validSignalKVesselIgnoringIdentity
  })

  //needed for the next test
  n2kMapper.toDelta({
    canId: 217969088,
    prio: 3,
    src: 192,
    dst: 255,
    pgn: 65009,
    direction: 'R',
    time: '18:58:11.940',
    fields: {
      reactivePower: 37888,
      powerFactor: 30517,
      powerFactorLagging: 'Leading'
    },
    description: 'Utility Phase B AC Reactive Power',
    timestamp: '2020-03-28T18:58:12.480Z'
  })

  it('65010 Utility Phase B AC Power', function () {
    var tree = toNested(
      JSON.parse(
        '{"canId":217969344,"prio":3,"src":192,"dst":255,"pgn":65010,"direction":"R","time":"18:58:11.941","fields":{"Real Power":772,"Apparent Power":772},"description":"Utility Phase B AC Power","timestamp":"2020-03-28T18:58:12.480Z"}'
      ),
      n2kMapper.state
    )
    tree.should.have.nested.property(
      'electrical.ac.8.phase.B.realPower.value',
      772
    )
    tree.should.have.nested.property(
      'electrical.ac.8.phase.B.apparentPower.value',
      23559124
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('65030 Generator Average Basic AC Quantities', function () {
    var tree = toNested(
      JSON.parse(
        '{"canId":217974465,"prio":3,"src":193,"dst":255,"pgn":65030,"direction":"R","time":"18:58:11.835","fields":{"Line-Line AC RMS Voltage":1,"Line-Neutral AC RMS Voltage":1,"AC Frequency":60.008,"AC RMS Current":0},"description":"Generator Average Basic AC Quantities","timestamp":"2020-03-28T18:58:12.477Z"}'
      ),
      n2kMapper.state
    )
    tree.should.have.nested.property(
      'electrical.generators.16.average.lineLineVoltage.value',
      1
    )
    tree.should.have.nested.property(
      'electrical.generators.16.average.lineNeutralVoltage.value',
      1
    )
    tree.should.have.nested.property(
      'electrical.generators.16.average.frequency.value',
      60.008
    )
    tree.should.have.nested.property(
      'electrical.generators.16.average.current.value',
      0
    )

    //tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
