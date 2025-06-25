var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

var mapper = require('./testMapper')

describe('129285 Route Information', function () {
  it('complete sentence converts', function () {
    var msg = JSON.parse(
      '{"timestamp":"2017-04-15T21:50:57.780Z","prio":6,"pgn":129285,"src":3,"dst":255,"fields":{"Start RPS#":12,"nItems":3,"Database ID":0,"Route ID":0,"Navigation direction in route":3,"Supplementary Route/WP data available":1,"Route Name":"Route","list":[{"WP ID":12,"WP Name":"Waypoint 240","WP Latitude":39.1525868,"WP Longitude":-76.1811988},{"WP ID":13,"WP Name":"Waypoint 241","WP Latitude":39.1568741,"WP Longitude":-76.1834715},{"WP ID":14,"WP Name":"Waypoint 242","WP Latitude":39.159168,"WP Longitude":-76.182178}]},"description":"Navigation - Route/WP Information"}'
    )
    var tree = mapper.toNested(msg)
    tree.should.have.nested.property(
      'navigation.currentRoute.name.value',
      'Route'
    )
    tree.should.have.nested.property(
      'navigation.currentRoute.waypoints.value[0].name',
      'Waypoint 240'
    )
    tree.should.have.nested.property(
      'navigation.currentRoute.waypoints.value[0].position.value.latitude',
      39.1525868
    )
    tree.should.have.nested.property(
      'navigation.currentRoute.waypoints.value[0].position.value.longitude',
      -76.1811988
    )

    tree.should.have.nested.property(
      'navigation.currentRoute.waypoints.value[1].name',
      'Waypoint 241'
    )
    tree.should.have.nested.property(
      'navigation.currentRoute.waypoints.value[1].position.value.latitude',
      39.1568741
    )
    tree.should.have.nested.property(
      'navigation.currentRoute.waypoints.value[1].position.value.longitude',
      -76.1834715
    )

    tree.should.have.nested.property(
      'navigation.currentRoute.waypoints.value[2].name',
      'Waypoint 242'
    )
    tree.should.have.nested.property(
      'navigation.currentRoute.waypoints.value[2].position.value.latitude',
      39.159168
    )
    tree.should.have.nested.property(
      'navigation.currentRoute.waypoints.value[2].position.value.longitude',
      -76.182178
    )
  })
})
