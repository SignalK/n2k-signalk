var chai = require('chai')
const { assertSensorClass } = require('./ais_utils')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

var mapper = require('./testMapper')

describe('129798 AIS SAR Aircraft Position Report', function () {
  it('complete sentence converts', function () {
    var msg = JSON.parse(
      '{"prio":4,"pgn":129798,"dst":255,"src":43,"timestamp":"2017-07-20T16:50:11.352Z", "fields":{"Message ID":9,"Repeat indicator":"Initial","User ID":100046,"Longitude":-75.8338099,"Latitude":39.6475617,"Position Accuracy":"High","RAIM":"in use","Time Stamp":"10","COG":2.227,"SOG":694.4,"Communication State":"33188","AIS Transceiver information":"Channel A VDL reception"},"description":"AIS SAR Aircraft Position Report"}'
    )
    var delta = mapper.toDelta(msg)
    delta.updates.length.should.equal(1)
    delta.context.should.equal('sar.urn:mrn:imo:mmsi:100046')
    assertSensorClass(delta, 'SAR')
    var tree = mapper.toNested(msg)
    tree.navigation.position.value.longitude.should.equal(-75.8338099)
    tree.navigation.position.value.latitude.should.equal(39.6475617)
    tree.should.have.nested.property(
      'navigation.courseOverGroundTrue.value',
      2.227
    )
    tree.should.have.nested.property('navigation.speedOverGround.value', 694.4)

    //TODO remove when sensors.ais.class is in schema
    delete tree.sensors.ais

    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
