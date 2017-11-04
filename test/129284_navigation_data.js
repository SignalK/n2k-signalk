var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

var mapper = require('./testMapper')

describe('129284 Navigation Data', function () {
  it('complete sentence converts', function () {
    var msg = JSON.parse(
      '{"timestamp":"2016-05-03T18:19:05.588Z","prio":3,"src":4,"dst":255,"pgn":129284,"description":"Navigation Data","fields":{"SID":231,"Distance to Waypoint":1910.38,"Course/Bearing reference":"True","Perpendicular Crossed":"No","Arrival Circle Entered":"No","Calculation Type":"Great Circle", "ETA Time": "03:01:46","ETA Date":"2016.05.04","Bearing, Origin to Destination Waypoint":2.6435,"Bearing, Position to Destination Waypoint":2.7651,"Origin Waypoint Number":0,"Destination Waypoint Number":1,"Destination Latitude":60.1366607,"Destination Longitude":24.9068518,"Waypoint Closing Velocity":0.06}}'
    )
    var tree = mapper.toNested(msg)
    tree.should.have.nested.property(
      'navigation.courseGreatCircle.bearingTrackTrue.value',
      2.6435
    )
    tree.should.have.nested.property(
      'navigation.courseGreatCircle.nextPoint.velocityMadeGood.value',
      0.06
    )
    tree.should.have.nested.property(
      'navigation.courseGreatCircle.nextPoint.distance.value',
      1910.38
    )
    tree.should.have.nested.property(
      'navigation.courseGreatCircle.nextPoint.bearingTrue.value',
      2.7651
    )
    tree.should.have.nested.property(
      'navigation.courseGreatCircle.nextPoint.position.value.latitude',
      60.1366607
    )
    tree.should.have.nested.property(
      'navigation.courseGreatCircle.nextPoint.position.value.longitude',
      24.9068518
    )
    tree.should.have.nested.property(
      'navigation.courseGreatCircle.nextPoint.timeToGo.value',
      31360.412
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
    var delta = mapper.toDelta(msg)
    delta.updates.length.should.equal(1)
  })
})
