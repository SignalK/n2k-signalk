import chai from 'chai'
import { assertSensorClass } from './ais_utils'
chai.should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

const mapper = require('./testMapper')

describe('129038 Class A Update', function () {
  it('complete sentence converts', function () {
    const msg = JSON.parse(
      '{"timestamp":"2014-08-15-15:00:01.665Z","prio":"4","src":"43","dst":"255","pgn":"129038","description":"AIS Class A Position Report","fields":{"Message ID":"1","Repeat Indicator":"Initial","User ID":"230982000","Longitude":25.2026083,"Latitude":60.2176150,"Position Accuracy":"High","RAIM":"not in use","Time Stamp":"0","COG":1.54,"SOG":2.26,"Communication State":"2286","AIS Transceiver information":"Channel B VDL reception","Heading":2.2672,"Rate of Turn":0.047,"Nav Status":"Under way using engine"}}'
    )
    const tree = mapper.toNested(msg)
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
    // The reparsed report has the special maneuver indicator Reserved, and
    // signalk-schema 1.3.1 has no navigation.specialManeuver (#408)
    delete tree.navigation.specialManeuver

    tree.should.be.validSignalKVesselIgnoringIdentity
    const delta = mapper.testToDelta(msg)
    delta.updates.length.should.equal(1)
    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:230982000')
    assertSensorClass(delta, 'A')
  })

  it('special maneuver converts', function () {
    const msg = JSON.parse(
      '{"timestamp":"2014-08-15-15:00:01.665Z","prio":"4","src":"43","dst":"255","pgn":"129038","description":"AIS Class A Position Report","fields":{"Message ID":"1","Repeat Indicator":"Initial","User ID":"230982000","Longitude":"25.2026083","Latitude":"60.2176150","Position Accuracy":"High","RAIM":"not in use","Time Stamp":"0","COG":"2.6878","SOG":"2.26","Communication State":"2286","AIS Transceiver information":"Channel B VDL reception","Heading":"2.6704","Rate of Turn":"0.047","Nav Status":"Under way using engine", "Special Maneuver Indicator": "Engaged in special maneuver"}}'
    )
    const tree = mapper.toNested(msg)
    tree.should.have.nested.property('navigation.state')
    tree.should.have.nested.property(
      'navigation.specialManeuver.value',
      'engaged'
    )
    tree.should.have.nested.property(
      'navigation.courseOverGroundTrue.value',
      2.6878
    )
    tree.should.have.nested.property('navigation.headingTrue.value', 2.6704)
    const delta = mapper.testToDelta(msg)
    delta.updates.length.should.equal(1)
    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:230982000')
  })

  it('no User Id produces no output', function () {
    const msg = {
      prio: 4,
      pgn: 129038,
      dst: 255,
      src: 3,
      timer: 9256.214,
      input: [
        '!PDGY,129038,4,3,255,9256.214,wwAAAAAp1QwGt4hmIMjsXAAAAAAAoHYAAPX+'
      ],
      fields: {
        'Message ID': 3,
        'User ID': 0,
        Longitude: 10.1504297,
        Latitude: 54.3590583,
        'Position Accuracy': 'Low',
        RAIM: 'not in use',
        'Time Stamp': '50',
        COG: 2.3788,
        SOG: 0,
        'Communication State': '0',
        'AIS Transceiver information': 'Channel A VDL reception',
        Heading: 3.0368,
        'Rate of Turn': 0,
        'Nav Status': 'Moored',
        'AIS Spare': '6'
      },
      description: 'AIS Class A Position Report',
      timestamp: '2022-05-09T13:38:38.917Z'
    }
    const deltaType = typeof mapper.testToDelta(msg, {})
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

describe('129038 navigation state', function () {
  const { FromPgn } = require('@canboat/canboatjs')
  const { N2kMapper } = require('../dist/n2kMapper')

  // merrimac-2022.raw in canboat's samples
  const restricted =
    '2022-09-10T12:06:57.943Z,4,129038,23,255,28,03,85,1f,98,0e,0c,1c,34,03,ab,d8,aa,1f,01,ef,f2,9a,00,c2,1a,00,ba,02,cc,ff,c3,f8,ff'

  function report() {
    return new FromPgn({ useCamel: true }).parseString(restricted)
  }

  function value(n2k: any, path: string) {
    const values = new N2kMapper().toDelta(n2k)!.updates[0].values
    return values.find((pv: any) => pv.path === path)?.value
  }

  it('writes Restricted maneuverability', function () {
    const n2k = report()
    n2k.fields.navStatus.should.equal('Restricted maneuverability')
    ;(value(n2k, 'navigation.state') as string).should.equal(
      'restricted manouverability'
    )
  })

  // No capture of the other states is available, so these change the
  // captured report's state.
  it('writes every state that Signal K has a value for', function () {
    ;[
      ['Under way using engine', 'motoring'],
      ['At anchor', 'anchored'],
      ['Not under command', 'not under command'],
      ['Constrained by her draught', 'constrained by draft'],
      ['Moored', 'moored'],
      ['Aground', 'aground'],
      ['Engaged in Fishing', 'fishing'],
      ['Under way sailing', 'sailing'],
      ['Hazardous material - High Speed', 'hazardous material high speed'],
      [
        'Hazardous material - Wing in Ground',
        'hazardous material wing in ground'
      ],
      ['AIS-SART', 'ais-sart']
    ].forEach(([navStatus, state]) => {
      const n2k = report()
      n2k.fields.navStatus = navStatus
      ;(value(n2k, 'navigation.state') as string).should.equal(state)
    })
  })

  it('writes no state for towing astern or pushing ahead', function () {
    ;[
      'Power-driven vessel towing astern',
      'Power-driven vessel pushing ahead or towing alongside',
      14
    ].forEach((navStatus) => {
      const n2k = report()
      n2k.fields.navStatus = navStatus
      ;(value(n2k, 'navigation.state') === undefined).should.equal(true)
    })
  })

  it('writes every special maneuver', function () {
    ;[
      ['Not available', 'not available'],
      ['Not engaged in special maneuver', 'not engaged'],
      ['Engaged in special maneuver', 'engaged'],
      ['Reserved', 'reserved']
    ].forEach(([indicator, specialManeuver]) => {
      const n2k = report()
      n2k.fields.specialManeuverIndicator = indicator
      ;(value(n2k, 'navigation.specialManeuver') as string).should.equal(
        specialManeuver
      )
    })
  })
})
