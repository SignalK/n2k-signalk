var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)
const assert = require('assert')
const signalkSchema = require('@signalk/signalk-schema')

describe('126720 Seatalk Displays', function () {
  it('birghtness converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:49.048Z","prio":7,"src":115,"dst":255,"pgn":126720, "description": "Seatalk1: Display Brightness", "fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry", "Proprietary ID": "Display", "Command": "Brightness", "Group": "Helm 1", "Brightness":50, "command1": "Settings"}}'
      )
    )
    tree.should.have.nested.property(
      'electrical.displays.raymarine.helm1.brightness.value',
      0.5
    )

    const meta = signalkSchema.getMetadata(
      'vessels.self.electrical.displays.raymarine.helm1.brightness'
    )
    assert.notEqual(meta, undefined)
    meta.should.have.property('units', 'ratio')
  })

  it('display color converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:49.048Z","prio":7,"src":115,"dst":255,"pgn":126720, "description": "Seatalk1: Display Color", "fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry", "Proprietary ID": "Display", "Command": "Color", "Group": "Helm 1", "Color":"Red/Black", "command1": "Settings"}}'
      )
    )
    tree.should.have.nested.property(
      'electrical.displays.raymarine.helm1.color.value',
      'red/black'
    )
  })
})
