var chai = require('chai')
chai.Should()
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('127237 Heading/Track Control ', function () {
  it('complete sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2021-07-13T07:00:01.412Z","prio":2,"src":0,"dst":255,"pgn":127237,"description":"Heading/Track control","fields":{"Heading Reference":"Magnetic","Heading-To-Steer (Course)":3.2115,"Track":0.0000}}'
      )
    )
    tree.steering.autopilot.target.headingMagnetic.should.have.property(
      'timestamp',
      '2021-07-13T07:00:01.412Z'
    )
    tree.steering.autopilot.target.headingMagnetic.should.have.property('value', 3.2115)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
