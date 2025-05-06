var chai = require('chai')
const { assertSensorClass } = require('./ais_utils')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

var mapper = require('./testMapper')

describe('129793 AIS UTC and Date Report (Base Station)', function () {
  it('complete sentence converts', function () {
    //2019-01-25T19:00:00.326Z,7,129793,43,255,26,04,77,43,25,00,bd,73,b1,02,ae,39,ef,1e,03,f0,db,c4,28,c9,c2,00,01,46,10,00,fc
    const msg = {
      timestamp: '2019-01-25T19:00:00.326Z',
      prio: 7,
      src: 43,
      dst: 255,
      pgn: 129793,
      description: 'AIS UTC and Date Report',
      fields: {
        'Message ID': 4,
        'Repeat Indicator': 'Initial',
        'User ID': 2442103,
        Longitude: 4.5183933,
        Latitude: 51.899435,
        'Position Accuracy': 'High',
        RAIM: 'in use',
        'Position Time': '18:59:59',
        'Communication State': '49865',
        'AIS Transceiver information': 'Channel A VDL reception',
        'Position Date': '2019.01.25',
        'GNSS type': 'GPS',
        Spare: '0'
      }
    }
    const delta = mapper.testToDelta(msg)
    delta.updates.length.should.equal(1)
    const values = delta.updates[0].values
    values.length.should.equal(3)
    values[0].path.should.equal('navigation.position')
    values[0].value.should.deep.equal({
      longitude: 4.5183933,
      latitude: 51.899435
    })
    values[1].path.should.equal('')
    values[1].value.should.deep.equal({
      mmsi: '002442103'
    })
    delta.context.should.equal('shore.basestations.urn:mrn:imo:mmsi:002442103')
    assertSensorClass(delta, 'BASE')
  })
})
