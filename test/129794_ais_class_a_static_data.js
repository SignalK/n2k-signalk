/*
 {
 "timestamp": "2014-08-15-15:01:01.881",
 "prio": "6",
 "src": "43",
 "dst": "255",
 "pgn": "129794",
 "description": "AIS Class A Static and Voyage Related Data",
 "fields": {
 "Message ID": "5",
 "Repeat indicator": "Initial",
 "User ID": "230939100",
 "IMO number": "0",
 "Callsign": "OJ7510",
 "Name": "RESCUE RAUTAUOMA",
 "Type of ship": "SAR",
 "Length": "16.0",
 "Beam": "4.0",
 "Position reference from Starboard": "2.0",
 "Position reference from Bow": "9.0",
 "ETA Date": "2014.11.30",
 "ETA Time": "25:00:00",
 "Draft": "1.00",
 "Destination": "HELSINKI LIFEBOAT",
 "AIS version indicator": "ITU-R M.1371-1",
 "GNSS type": "GPS",
 "DTE": "available",
 "Reserved": "0",
 "AIS Transceiver information": "Channel B VDL reception"
 }
 }
 */

const chai = require('chai')
const { assertSensorClass } = require('./ais_utils')
const expect = chai.expect
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

var mapper = require('./testMapper')

describe('129794 AIS Class A Static and Voyage Related Data', function () {
  it('complete sentence converts', function () {
    var msg = JSON.parse(
      '{"timestamp":"2017-03-13T18:30:56.945Z","prio":6,"src":43,"dst":255,"pgn":129794,"description":"AIS Class A Static and Voyage Related Data","fields":{"Message ID":5,"Repeat indicator":"Initial","User ID":356307000,"IMO number":9683362,"Callsign":"3FJJ4","Name":"SILVER GWEN","Type of ship":"Tanker hazard cat C","Length":183.0,"Beam":32.0,"Position reference from Starboard":8.0,"Position reference from Bow":147.0,"ETA Date":"2018.03.11", "ETA Time": "07:00:00","Draft":10.60,"Destination":"USA (BALTIMORE)","AIS version indicator":"ITU-R M.1371-3","GNSS type":"GPS","DTE":"available","AIS Transceiver information":"Channel A VDL reception"}}'
    )
    var delta = mapper.toDelta(msg)
    delta.updates.length.should.equal(1)
    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:356307000')
    assertSensorClass(delta, 'A')

    const valuesWithEmptyPath = delta.updates[0].values.filter(pathValue => pathValue.path === '')
    valuesWithEmptyPath.length.should.equal(3)
    expect(valuesWithEmptyPath).to.have.deep.members([{
      path: '',
      value: {
        name: 'SILVER GWEN'
      }
    }, {
      path: '',
      value: {
        'mmsi': '356307000'
      }
    }, {
      path: '',
      value: {
        registrations: {
          imo: 'IMO 9683362'
        }
      }
    }])
    var tree = mapper.toNested(msg)
    tree.should.have.nested.property('design.draft.value.maximum', 10.6)
    tree.should.have.nested.property('design.length.value.overall', 183.0)
    tree.should.have.nested.property('design.aisShipType.value.id', 83)
    tree.should.have.nested.property(
      'design.aisShipType.value.name',
      'Tanker hazard cat C'
    )
    tree.should.have.nested.property('design.beam.value', 32.0)
    tree.should.have.nested.property(
      'navigation.destination.commonName.value',
      'USA (BALTIMORE)'
    )
    tree.should.have.nested.property('sensors.ais.fromBow.value', 147.0)
    tree.should.have.nested.property('sensors.ais.fromCenter.value', 8)
    delete tree.design.aisShipType
    //TODO enable when sensors.ais.class is in the schema
    //tree.should.be.validSignalKVesselIgnoringIdentity
  })

  it('Empty destination converts to empty string', () => {
    const msg = {
      "prio": 6,
      "pgn": 129794,
      "dst": 255,
      "src": 43,
      "timestamp": "2014-08-15T19:05:41.030Z",
      "input": [
        "2014-08-15T19:05:41.030Z,6,129794,43,255,75,05,b0,7f,79,10,00,00,00,00,45,53,59,32,31,31,31,50,56,4c,2d,31,31,31,20,56,41,50,50,45,52,20,20,20,20,20,20,37,7c,01,3c,00,14,00,b4,00,14,40,00,00,00,00,00,00,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,00,e1"
      ],
      "fields": {
        "Message ID": 5,
        "Repeat indicator": "Initial",
        "User ID": 276398000,
        "IMO number": 0,
        "Callsign": "ESY2111",
        "Name": "PVL-111 VAPPER",
        "Type of ship": "Law enforcement",
        "Length": 38,
        "Beam": 6,
        "Position reference from Starboard": 2,
        "Position reference from Bow": 18,
        "ETA Date": "2014.11.30",
        "ETA Time": "00:00:00",
        "Draft": 0,
        "Destination": "",
        "AIS version indicator": "ITU-R M.1371-1",
        "GNSS type": "undefined",
        "DTE": "available",
        "Reserved1": "0",
        "AIS Transceiver information": "Channel B VDL reception"
      },
      "description": "AIS Class A Static and Voyage Related Data"
    }
    const delta = mapper.toDelta(msg)
    delta.updates[0].values.find((pv) => pv.path === 'navigation.destination.commonName').value.should.equal('')
  })
})
