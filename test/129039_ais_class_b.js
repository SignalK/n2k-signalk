var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

var mapper = require('./testMapper')

describe('129039 Class B Update', function () {
  it('complete sentence converts', function () {
    var msg = JSON.parse(
      '{"timestamp":"2014-08-15-16:00:00.257Z","prio":"4","src":"43","dst":"255","pgn":"129039","description":"AIS Class B Position Report","fields":{"Message ID":"18","Repeat Indicator":"Initial","User ID":"230035780","Longitude":"24.9024733","Latitude":"60.0395100","Position Accuracy":"High","RAIM":"in use","Time Stamp":"0","COG":"167.7","SOG":"3.75","Communication State":"393222","AIS Transceiver information":"Own information not broadcast","Regional Application":"0","Regional Application":"0","Unit type":"CS","Integrated Display":"No","DSC":"Yes","Band":"entire marine band","Can handle Msg 22":"Yes","AIS mode":"Autonomous","AIS communication state":"ITDMA","Heading": "153.0"}}'
    )
    var tree = mapper.toNested(msg)
    tree.should.have.nested.property('navigation.courseOverGroundTrue')
    tree.should.have.nested.property(
      'navigation.courseOverGroundTrue.value',
      167.7
    )
    tree.should.have.nested.property('navigation.speedOverGround')
    tree.should.have.nested.property('navigation.speedOverGround.value', 3.75)
    tree.navigation.position.longitude.should.equal(24.9024733)
    tree.navigation.position.latitude.should.equal(60.03951)
    tree.should.have.nested.property('navigation.headingTrue')
    tree.should.have.nested.property('navigation.headingTrue.value', 153.0)
    tree.should.be.validSignalKVesselIgnoringIdentity
    var delta = mapper.toDelta(msg)
    delta.updates.length.should.equal(1)
    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:230035780')
  })
})
