var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

const mapper = require('./testMapper')

var state = {}

describe('129283 cross track error', function () {
  it('complete cross track error converts', function () {
    mapper.toNested(
      JSON.parse(
        '{"timestamp":"2016-05-03T18:19:05.588Z","prio":3,"src":3,"dst":255,"pgn":129284,"description":"Navigation Data","fields":{"SID":231,"Distance to Waypoint":1910.38,"Course/Bearing reference":"True","Perpendicular Crossed":"No","Arrival Circle Entered":"No","Calculation Type":"Great Circle", "ETA Time": "03:01:46","ETA Date":"2016.05.04","Bearing, Origin to Destination Waypoint":2.6435,"Bearing, Position to Destination Waypoint":2.7651,"Origin Waypoint Number":0,"Destination Waypoint Number":1,"Destination Latitude":60.1366607,"Destination Longitude":24.9068518,"Waypoint Closing Velocity":0.06}}'
      ),
      state
    )
    var tree = mapper.toNested(
      JSON.parse(
        '{"timestamp":"2016-08-11T07:58:36.263Z","prio":3,"src":3,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"XTE mode":"Autonomous","Navigation Terminated":"No","XTE":-5.63}}'
      ),
      state
    )

    tree.should.have.nested.property(
      'navigation.courseGreatCircle.crossTrackError.value',
      -5.63
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('complete cross track error without state converts', function () {
    var tree = mapper.toNested(
      JSON.parse(
        '{"timestamp":"2016-08-11T07:58:36.263Z","prio":3,"src":3,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"XTE mode":"Autonomous","Navigation Terminated":"No","XTE":-5.63}}'
      ),
      {}
    )
    tree.should.not.have.nested.property(
      'navigation.courseGreatCircle.crossTrackError.value'
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('does not choke when state is null', function() {
    var tree = mapper.toNested(
      JSON.parse(
        '{"timestamp":"2016-08-11T07:58:36.263Z","prio":3,"src":3,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"XTE mode":"Autonomous","Navigation Terminated":"No","XTE":-5.63}}'
      ),
      null
    )
    tree.should.not.have.nested.property(
      'navigation.courseGreatCircle.crossTrackError.value'
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
