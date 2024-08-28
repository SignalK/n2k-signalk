var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('130845 Simrad Displays', function () {
  it('birghtness converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:49.048Z","prio":7,"src":115,"dst":255,"pgn":130845,"fields":{"Manufacturer Code":"Simrad","Industry Code":"Marine Industry","Display Group": "Group 1", "Key":"Backlight level","Value":50}}'
      )
    )
    tree.should.have.nested.property(
      'electrical.displays.navico.group1.brightness.value',
      0.5
    )
  })

  it('night mode converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:49.048Z","prio":7,"src":115,"dst":255,"pgn":130845,"fields":{"Manufacturer Code":"Simrad","Industry Code":"Marine Industry","Display Group": "Group 1", "Key":"Night mode","Value":4}}'
      )
    )
    tree.should.have.nested.property(
      'electrical.displays.navico.group1.nightMode.state.value',
      1
    )
  })

  it('night mode color converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:49.048Z","prio":7,"src":115,"dst":255,"pgn":130845,"fields":{"Manufacturer Code":"Simrad","Industry Code":"Marine Industry","Display Group": "Group 1", "Key":"Night mode color","Value":1}}'
      )
    )
    tree.should.have.nested.property(
      'electrical.displays.navico.group1.nightModeColor.value',
      'green'
    )
  })
})
