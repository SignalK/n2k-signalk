var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('126720 Seatalk Displays', function () {
  it('birghtness converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:49.048Z","prio":7,"src":115,"dst":255,"pgn":126720, "description": "Seatalk1: Display Brightness", "fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry", "Proprietary ID": 3212, "Command": "Brightness", "Group": "Helm 1", "Brightness":50}}'
      )
    )
    tree.should.have.nested.property(
      'electrical.displays.raymarine.helm1.brightness.value',
      0.5
    )
  })

  it('display color converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:49.048Z","prio":7,"src":115,"dst":255,"pgn":126720, "description": "Seatalk1: Display Color", "fields":{"Manufacturer Code":"Raymarine","Industry Code":"Marine Industry", "Proprietary ID": 3212, "Command": "Color", "Group": "Helm 1", "Color":"Red/Black"}}'
      )
    )
    tree.should.have.nested.property(
      'electrical.displays.raymarine.helm1.color.value',
      'red/black'
    )
  })
})
