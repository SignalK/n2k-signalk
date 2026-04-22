var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

var mapper = require('./testMapper')

var state = {}

describe('129285 Route Information', function () {
  it('3-waypoint message converts all points', function () {
    mapper.toNested(
      JSON.parse(
        '{"timestamp":"2016-05-03T18:19:05.588Z","prio":3,"src":3,"dst":255,"pgn":129284,"description":"Navigation Data","fields":{"SID":231,"Distance to Waypoint":1910.38,"Course/Bearing reference":"True","Perpendicular Crossed":"No","Arrival Circle Entered":"No","Calculation Type":"Great Circle", "ETA Time": "03:01:46","ETA Date":"2016.05.04","Bearing, Origin to Destination Waypoint":2.6435,"Bearing, Position to Destination Waypoint":2.7651,"Origin Waypoint Number":0,"Destination Waypoint Number":1,"Destination Latitude":60.1366607,"Destination Longitude":24.9068518,"Waypoint Closing Velocity":0.06}}'
      ),
      state
    )
    var tree = mapper.toNested(
      JSON.parse(
        '{"timestamp":"2017-04-15T21:50:57.780Z","prio":6,"pgn":129285,"src":3,"dst":255,"fields":{"Start RPS#":12,"nItems":3,"Database ID":0,"Route ID":0,"Navigation direction in route":3,"Supplementary Route/WP data available":1,"Route Name":"Route","list":[{"WP ID":12,"WP Name":"Waypoint 240","WP Latitude":39.1525868,"WP Longitude":-76.1811988},{"WP ID":13,"WP Name":"Waypoint 241","WP Latitude":39.1568741,"WP Longitude":-76.1834715},{"WP ID":14,"WP Name":"Waypoint 242","WP Latitude":39.159168,"WP Longitude":-76.182178}]},"description":"Navigation - Route/WP Information"}'
      ),
      state
    )

    tree.should.have.nested.property(
      'navigation.courseGreatCircle.activeRoute.name.value',
      'Route'
    )
    tree.should.have.nested.property(
      'navigation.courseGreatCircle.previousPoint.name.value',
      'Waypoint 240'
    )
    tree.should.have.nested.property(
      'navigation.courseGreatCircle.previousPoint.position.value.latitude',
      39.1525868
    )
    tree.should.have.nested.property(
      'navigation.courseGreatCircle.previousPoint.position.value.longitude',
      -76.1811988
    )
    tree.should.have.nested.property(
      'navigation.courseGreatCircle.nextPoint.name.value',
      'Waypoint 241'
    )
    tree.should.have.nested.property(
      'navigation.courseGreatCircle.followingPoint.name.value',
      'Waypoint 242'
    )
    tree.should.have.nested.property(
      'navigation.courseGreatCircle.followingPoint.position.value.latitude',
      39.159168
    )
    tree.should.have.nested.property(
      'navigation.courseGreatCircle.followingPoint.position.value.longitude',
      -76.182178
    )
  })

  it('2-waypoint message has no followingPoint', function () {
    mapper.toNested(
      JSON.parse(
        '{"timestamp":"2016-05-03T18:19:05.588Z","prio":3,"src":3,"dst":255,"pgn":129284,"description":"Navigation Data","fields":{"SID":231,"Distance to Waypoint":1910.38,"Course/Bearing reference":"True","Perpendicular Crossed":"No","Arrival Circle Entered":"No","Calculation Type":"Great Circle", "ETA Time": "03:01:46","ETA Date":"2016.05.04","Bearing, Origin to Destination Waypoint":2.6435,"Bearing, Position to Destination Waypoint":2.7651,"Origin Waypoint Number":0,"Destination Waypoint Number":1,"Destination Latitude":60.1366607,"Destination Longitude":24.9068518,"Waypoint Closing Velocity":0.06}}'
      ),
      state
    )
    var tree = mapper.toNested(
      JSON.parse(
        '{"timestamp":"2017-04-15T21:50:57.780Z","prio":6,"pgn":129285,"src":3,"dst":255,"fields":{"Start RPS#":12,"nItems":2,"Database ID":0,"Route ID":0,"Navigation direction in route":3,"Supplementary Route/WP data available":1,"Route Name":"Route","list":[{"WP ID":12,"WP Name":"Waypoint 240","WP Latitude":39.1525868,"WP Longitude":-76.1811988},{"WP ID":13,"WP Name":"Waypoint 241","WP Latitude":39.1568741,"WP Longitude":-76.1834715}]},"description":"Navigation - Route/WP Information"}'
      ),
      state
    )

    tree.should.have.nested.property(
      'navigation.courseGreatCircle.activeRoute.name.value',
      'Route'
    )
    tree.should.have.nested.property(
      'navigation.courseGreatCircle.previousPoint.name.value',
      'Waypoint 240'
    )
    tree.should.have.nested.property(
      'navigation.courseGreatCircle.nextPoint.name.value',
      'Waypoint 241'
    )
    tree.should.not.have.nested.property(
      'navigation.courseGreatCircle.followingPoint'
    )
  })

  it('without state produces no output', function () {
    var tree = mapper.toNested(
      JSON.parse(
        '{"timestamp":"2017-04-15T21:50:57.780Z","prio":6,"pgn":129285,"src":3,"dst":255,"fields":{"Start RPS#":12,"nItems":3,"Database ID":0,"Route ID":0,"Navigation direction in route":3,"Supplementary Route/WP data available":1,"Route Name":"Route","list":[{"WP ID":12,"WP Name":"Waypoint 240","WP Latitude":39.1525868,"WP Longitude":-76.1811988},{"WP ID":13,"WP Name":"Waypoint 241","WP Latitude":39.1568741,"WP Longitude":-76.1834715},{"WP ID":14,"WP Name":"Waypoint 242","WP Latitude":39.159168,"WP Longitude":-76.182178}]},"description":"Navigation - Route/WP Information"}'
      ),
      {}
    )
    tree.should.not.have.nested.property('navigation.courseGreatCircle')
    tree.should.not.have.nested.property('navigation.courseRhumbline')
  })

  it('null state does not crash', function () {
    var tree = mapper.toNested(
      JSON.parse(
        '{"timestamp":"2017-04-15T21:50:57.780Z","prio":6,"pgn":129285,"src":3,"dst":255,"fields":{"Start RPS#":12,"nItems":3,"Database ID":0,"Route ID":0,"Navigation direction in route":3,"Supplementary Route/WP data available":1,"Route Name":"Route","list":[{"WP ID":12,"WP Name":"Waypoint 240","WP Latitude":39.1525868,"WP Longitude":-76.1811988},{"WP ID":13,"WP Name":"Waypoint 241","WP Latitude":39.1568741,"WP Longitude":-76.1834715},{"WP ID":14,"WP Name":"Waypoint 242","WP Latitude":39.159168,"WP Longitude":-76.182178}]},"description":"Navigation - Route/WP Information"}'
      )
    )
    tree.should.not.have.nested.property('navigation.courseGreatCircle')
    tree.should.not.have.nested.property('navigation.courseRhumbline')
  })
})
