var chai = require("chai");
chai.Should();
chai.use(require('chai-things'));
chai.use(require('signalk-schema').chaiModule);

var mapper = require("../n2kMapper.js");


describe('129284 Navigation Data', function () {
  it('complete sentence converts', function () {
    var msg = JSON.parse('{"timestamp":"2016-05-03T18:19:05.588Z","prio":3,"src":4,"dst":255,"pgn":129284,"description":"Navigation Data","fields":{"SID":231,"Distance to Waypoint":1910.38,"Course/Bearing reference":"True","Perpendicular Crossed":"No","Arrival Circle Entered":"No","Calculation Type":"Great Circle", "ETA Time": "03:01:46","ETA Date":"2016.05.04","Bearing, Origin to Destination Waypoint":2.6435,"Bearing, Position to Destination Waypoint":2.7651,"Origin Waypoint Number":0,"Destination Waypoint Number":1,"Destination Latitude":60.1366607,"Destination Longitude":24.9068518,"Waypoint Closing Velocity":0.06}}');
    var tree = mapper.toNested(msg);
    console.log(tree)
    tree.should.have.deep.property('navigation.courseGreatCircle.bearingTrackTrue.value', 2.6435);
    tree.should.have.deep.property('navigation.courseGreatCircle.nextPoint.velocityMadeGood', 0.06);
    tree.should.have.deep.property('navigation.courseGreatCircle.nextPoint.distance', 1910.38);
    tree.should.have.deep.property('navigation.courseGreatCircle.nextPoint.bearingTrue', 2.7651);
    tree.should.have.deep.property('navigation.courseGreatCircle.nextPoint.position.latitude', 60.1366607);
    tree.should.have.deep.property('navigation.courseGreatCircle.nextPoint.position.longitude', 24.9068518);
    tree.should.have.deep.property('navigation.courseGreatCircle.activeRoute.estimatedTimeOfArrival', '2016-05-04T03:01:46Z');
    tree.should.be.validSignalKVesselIgnoringIdentity;
    var delta = mapper.toDelta(msg);
    console.log(JSON.stringify(delta.updates[0], null, 2))
    delta.updates.length.should.equal(1);
  });
});
