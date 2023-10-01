var chai = require('chai')
const assert = require('assert')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

var mapper = require('./testMapper')
const { assertSensorClass } = require('./ais_utils')

describe('129039 Class B Update', function () {
  it('complete self sentence converts', function () {
    var msg = JSON.parse(
      '{"timestamp":"2014-08-15-16:00:00.257Z","prio":"4","src":"43","dst":"255","pgn":"129039","description":"AIS Class B Position Report","fields":{"Message ID":"18","Repeat Indicator":"Initial","User ID":"230035780","Longitude":24.9024733,"Latitude":60.0395100,"Position Accuracy":"High","RAIM":"in use","Time Stamp":"0","COG":1.2,"SOG":3.75,"Communication State":"393222","AIS Transceiver information":"Own information not broadcast","Regional Application":"0","Regional Application":"0","Unit type":"CS","Integrated Display":"No","DSC":"Yes","Band":"entire marine band","Can handle Msg 22":"Yes","AIS mode":"Autonomous","AIS communication state":"ITDMA","Heading": 0.23}}'
    )
    var tree = mapper.toNested(msg)
    tree.should.have.nested.property('navigation.courseOverGroundTrue')
    tree.should.have.nested.property(
      'navigation.courseOverGroundTrue.value',
      1.2
    )
    tree.should.have.nested.property('navigation.speedOverGround')
    tree.should.have.nested.property('navigation.speedOverGround.value', 3.75)
    tree.navigation.position.value.longitude.should.equal(24.9024733)
    tree.navigation.position.value.latitude.should.equal(60.03951)
    tree.should.have.nested.property('navigation.headingTrue')
    tree.should.have.nested.property('navigation.headingTrue.value', 0.23)

    //TODO remove when sensors.ais.class is in schema
    delete tree.sensors.ais

    tree.should.be.validSignalKVesselIgnoringIdentity
    var delta = mapper.toDelta(msg)
    delta.updates.length.should.equal(1)
    assert.equal(delta.context, 'vessels.urn:mrn:imo:mmsi:230035780')
    assertSensorClass(delta, 'B')
  })

  it('complete other sentence converts', function () {
    var msg = JSON.parse(
      '{"timestamp":"2018-08-09T14:37:29.096Z","prio":4,"pgn":129039,"src":43,"dst":255,"fields":{"Message ID":18,"Repeat Indicator":"Initial","User ID":235087238,"Longitude":-76.1882515,"Latitude":39.1087383,"Position Accuracy":"High","RAIM":"in use","Time Stamp":"28","COG":1.3177,"SOG":2.88,"Communication State":"393222","AIS Transceiver information":"Channel B VDL reception","Regional Application":0,"Unit type":"CS","Integrated Display":"No","DSC":"Yes","Band":"entire marine band","Can handle Msg 22":"Yes","AIS mode":"Autonomous","AIS communication state":"ITDMA"},"description":"AIS Class B Position Report"}'
    )
    var tree = mapper.toNested(msg)
    tree.should.have.nested.property('navigation.courseOverGroundTrue')
    tree.should.have.nested.property(
      'navigation.courseOverGroundTrue.value',
      1.3177
    )
    tree.should.have.nested.property('navigation.speedOverGround')
    tree.should.have.nested.property('navigation.speedOverGround.value', 2.88)
    tree.navigation.position.value.longitude.should.equal(-76.1882515)
    tree.navigation.position.value.latitude.should.equal(39.1087383)

    //TODO remove when sensors.ais.class is in schema
    delete tree.sensors.ais

    tree.should.be.validSignalKVesselIgnoringIdentity
    var delta = mapper.toDelta(msg)
    delta.updates.length.should.equal(1)
    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:235087238')
    assertSensorClass(delta, 'B')
  })
})
