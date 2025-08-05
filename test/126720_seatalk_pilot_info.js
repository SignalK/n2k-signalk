var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)
const assert = require('assert')
const signalkSchema = require('@signalk/signalk-schema')

describe('126720 Seatalk Pilot Info', function () {
  it('auto turn converts', function () {
    var tree = require('./testMapper').toNested({
      pgn: 126720,
      prio: 7,
      src: 204,
      dst: 7,
      timestamp: '2025-08-04T18:15:55.096Z',
      description: 'Seatalk: Pilot Auto Turn',
      fields: {
        manufacturerCode: 'Raymarine',
        industryCode: 'Marine Industry',
        proprietaryId: 'Pilot Configuration',
        command: 'Auto Turn',
        enabled: 'Yes'
      }
    })
    tree.should.have.nested.property(
      'steering.autopilot.autoTurn.state.value',
      true
    )
    const meta = signalkSchema.getMetadata(
      'vessels.self.steering.autopilot.autoTurn.state'
    )
    assert.notEqual(meta, undefined)
    meta.should.have.property('units', 'bool')
  })

  it('hull type converts', function () {
    var tree = require('./testMapper').toNested({
      pgn: 126720,
      prio: 7,
      src: 204,
      dst: 7,
      timestamp: '2025-08-04T18:42:56.029Z',
      description: 'Seatalk1: Pilot Hull Type',
      fields: {
        manufacturerCode: 'Raymarine',
        industryCode: 'Marine Industry',
        proprietaryId: 'Pilot Configuration',
        command: 'Hull Type',
        hullType: 'Power'
      }
    })
    tree.should.have.nested.property(
      'steering.autopilot.hullType.value',
      'power'
    )
  })
})
