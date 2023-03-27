var chai = require('chai')
const { assertSensorClass } = require('./ais_utils')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

var mapper = require('./testMapper')

describe('129038 Class A Update', function () {
  it('complete sentence converts', function () {
    var msg = JSON.parse(
      '{"timestamp":"2014-08-15-15:00:01.665Z","prio":"4","src":"43","dst":"255","pgn":"129038","description":"AIS Class A Position Report","fields":{"Message ID":"1","Repeat Indicator":"Initial","User ID":"230982000","Longitude":25.2026083,"Latitude":60.2176150,"Position Accuracy":"High","RAIM":"not in use","Time Stamp":"0","COG":1.54,"SOG":2.26,"Communication State":"2286","AIS Transceiver information":"Channel B VDL reception","Heading":2.2672,"Rate of Turn":0.047,"Nav Status":"Under way using engine"}}'
    )
    var tree = mapper.toNested(msg)
    tree.should.have.nested.property('navigation.courseOverGroundTrue')
    tree.should.have.nested.property(
      'navigation.courseOverGroundTrue.value',
      1.54
    )
    tree.should.have.nested.property('navigation.speedOverGround')
    tree.should.have.nested.property('navigation.speedOverGround.value', 2.26)
    tree.navigation.position.value.longitude.should.equal(25.2026083)
    tree.navigation.position.value.latitude.should.equal(60.217615)
    tree.should.have.nested.property('navigation.rateOfTurn')
    tree.should.have.nested.property('navigation.rateOfTurn.value', 0.047)
    tree.should.have.nested.property('navigation.headingTrue')
    tree.should.have.nested.property('navigation.headingTrue.value', 2.2672)
    tree.should.have.nested.property('navigation.state')
    tree.should.have.nested.property('navigation.state.value', 'motoring')

    //TODO remove when sensors.ais.class is in schema
    delete tree.sensors.ais

    tree.should.be.validSignalKVesselIgnoringIdentity
    var delta = mapper.toDelta(msg)
    delta.updates.length.should.equal(1)
    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:230982000')
    assertSensorClass(delta, 'A')
  })

  it('special maneuver converts', function () {
    var msg = JSON.parse(
      '{"timestamp":"2014-08-15-15:00:01.665Z","prio":"4","src":"43","dst":"255","pgn":"129038","description":"AIS Class A Position Report","fields":{"Message ID":"1","Repeat Indicator":"Initial","User ID":"230982000","Longitude":"25.2026083","Latitude":"60.2176150","Position Accuracy":"High","RAIM":"not in use","Time Stamp":"0","COG":"154.0","SOG":"2.26","Communication State":"2286","AIS Transceiver information":"Channel B VDL reception","Heading":"153.0","Rate of Turn":"0.047","Nav Status":"Under way using engine", "Special Maneuver Indicator": "Engaged in special maneuver"}}'
    )
    var tree = mapper.toNested(msg)
    tree.should.have.nested.property('navigation.state')
    tree.should.have.nested.property('navigation.specialManeuver.value', 'engaged')
    var delta = mapper.toDelta(msg)
    delta.updates.length.should.equal(1)
    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:230982000')
  })

  it('no User Id produces no output', function () {
    const msg = {
      "prio": 4,
      "pgn": 129038,
      "dst": 255,
      "src": 3,
      "timer": 9256.214,
      "input": [
        "!PDGY,129038,4,3,255,9256.214,wwAAAAAp1QwGt4hmIMjsXAAAAAAAoHYAAPX+"
      ],
      "fields": {
        "Message ID": 3,
        "User ID": 0,
        "Longitude": 10.1504297,
        "Latitude": 54.3590583,
        "Position Accuracy": "Low",
        "RAIM": "not in use",
        "Time Stamp": "50",
        "COG": 2.3788,
        "SOG": 0,
        "Communication State": "0",
        "AIS Transceiver information": "Channel A VDL reception",
        "Heading": 3.0368,
        "Rate of Turn": 0,
        "Nav Status": "Moored",
        "AIS Spare": "6"
      },
      "description": "AIS Class A Position Report",
      "timestamp": "2022-05-09T13:38:38.917Z"
    }
    const deltaType = typeof mapper.toDelta(msg, {})
    deltaType.should.equal('undefined')
  })
})

/*
 {
 "timestamp": "2014-08-15-15:00:01.665",
 "prio": "4",
 "src": "43",
 "dst": "255",
 "pgn": "129038",
 "description": "AIS Class A Position Report",
 "fields": {
 "Message ID": "1",
 "Repeat Indicator": "Initial",
 "User ID": "230982000",
 "Longitude": "25.2026083",
 "Latitude": "60.2176150",
 "Position Accuracy": "High",
 "RAIM": "not in use",
 "Time Stamp": "0",
 "COG": "154.0",
 "SOG": "2.26",
 "Communication State": "2286",
 "AIS Transceiver information": "Channel B VDL reception",
 "Heading": "153.0",
 "Rate of Turn": "0.047",
 "Nav Status": "Under way using engine"
 }
 */
