import chai from 'chai'
chai.should()
chai.use(require('@signalk/signalk-schema').chaiModule)
import testMapper = require('./testMapper')

describe('65285 Lowrance Temperature ', function () {
  it('complete sentence converts', function () {
    const tree = testMapper.toNested(
      JSON.parse(
        '{"timestamp": "2015-01-15-16:25:14.120Z","prio": 0,"src": 5,"dst": 255,"pgn": 65285,"description": "Lowrance: Temperature","fields": {"Manufacturer Code":"Lowrance","Industry Code":"Marine Industry","Temperature Source":"Engine Room Temperature", "Actual Temperature": 25.60}}'
      )
    )
    tree.environment.inside.engineRoom.temperature.should.have.property(
      'value',
      25.6
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('converts livewell to a tank temperature', function () {
    const tree = testMapper.toNested(
      JSON.parse(
        '{"timestamp": "2015-01-15-16:25:14.120Z","prio": 0,"src": 5,"dst": 255,"pgn": 65285,"description": "Lowrance: Temperature","fields": {"Manufacturer Code":"Lowrance","Industry Code":"Marine Industry","Temperature Source":"Live Well Temperature", "Actual Temperature": 15.60}}'
      )
    )
    tree.tanks.liveWell.default.temperature.should.have.property('value', 15.6)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('writes no source.instance, as 65285 has none', function () {
    const delta = testMapper.testToDelta(
      JSON.parse(
        '{"timestamp": "2015-01-15-16:25:14.120Z","prio": 0,"src": 5,"dst": 255,"pgn": 65285,"description": "Lowrance: Temperature","fields": {"Manufacturer Code":"Lowrance","Industry Code":"Marine Industry","Temperature Source":"Live Well Temperature", "Actual Temperature": 15.60}}'
      )
    )
    delta.updates[0].source.should.not.have.property('instance')
  })

  it('writes a reading of 0', function () {
    // Straight to the mapper, as decoded fields
    const tree = testMapper.n2kToNested({
      timestamp: '2015-01-15T16:25:14.120Z',
      prio: 0,
      src: 5,
      dst: 255,
      pgn: 65285,
      fields: {
        manufacturerCode: 'Lowrance',
        industryCode: 'Marine Industry',
        temperatureSource: 'Engine Room Temperature',
        actualTemperature: 0
      }
    })
    tree.environment.inside.engineRoom.temperature.should.have.property(
      'value',
      0
    )
  })
})
