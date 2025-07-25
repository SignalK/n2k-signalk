var chai = require('chai')
const { assertSensorClass } = require('./ais_utils')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

var mapper = require('./testMapper')

describe('129040 AIS Class B Extended Position Repeat', function () {
  it('complete sentence converts', function () {
    var msg = JSON.parse(
      '{"timestamp":"2014-08-15-15:01:01.881Z","prio":"6","src":"43","dst":"255","pgn":"129040","description":"AIS Class B Extended Position Report","fields":{"Message ID":"5","Repeat indicator":"Initial","User ID":"230939100","Name":"RESCUE RAUTAUOMA","Type of ship":"SAR","Length":16.0,"Beam":4.0,"Position reference from Starboard":2.0,"Position reference from Bow":9.0,"ETA Date":"2014.11.30", "ETA Time": "25:00:00","Draft":"1.00","AIS version indicator":"ITU-R M.1371-1","GNSS type":"GPS","DTE":"available","Reserved":"0","AIS Transceiver information":"Channel B VDL reception", "True Heading": 1.58,"Longitude":25.2026083,"Latitude":60.2176150,"COG":1.54,"SOG":2.26}}'
    )
    var delta = mapper.testToDelta(msg)
    delta.updates.length.should.equal(1)
    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:230939100')
    delta.updates[0].values[0].path.should.equal('')
    delta.updates[0].values[0].value.name.should.equal('RESCUE RAUTAUOMA')
    assertSensorClass(delta, 'B')

    var tree = mapper.toNested(msg)
    tree.should.have.nested.property('design.length.value.overall', 16.0)
    tree.should.have.nested.property('design.aisShipType.value.id', 51)
    tree.should.have.nested.property('design.aisShipType.value.name', 'SAR')
    tree.should.have.nested.property('design.beam.value', 4.0)
    tree.navigation.position.value.longitude.should.equal(25.2026083)
    tree.navigation.position.value.latitude.should.equal(60.217615)
    tree.should.have.nested.property('navigation.courseOverGroundTrue')
    tree.should.have.nested.property(
      'navigation.courseOverGroundTrue.value',
      1.54
    )
    tree.should.have.nested.property('navigation.speedOverGround')
    tree.should.have.nested.property('navigation.speedOverGround.value', 2.26)
    tree.should.have.nested.property('navigation.headingTrue.value', 1.58)
    tree.should.have.nested.property('sensors.ais.fromBow.value', 9.0)
    tree.should.have.nested.property('sensors.ais.fromCenter.value', 0)
    delete tree.design.aisShipType

    //TODO remove when sensors.ais.class is in schema
    delete tree.sensors.ais

    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
