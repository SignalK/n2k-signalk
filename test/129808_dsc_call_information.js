var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

var mapper = require('./testMapper')
var { FromPgn } = require('@canboat/canboatjs')

// Real frames, from canboat's samples/pgn129808.raw.
var MOB_DISTRESS =
  '2022-04-17-04:35:34.254,4,129808,3,255,83,70,70,33,14,00,5f,1e,6e,64,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,12,01,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,70,69,80,e7,77,b1,3a,68,c0,a6,c1,04,ff,ff,ff,ff,ff,7f,fd,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,64,0a,01,30,38'
var COAST_STATION_ALL_SHIPS =
  '2026-08-27-11:03:58.994,4,129808,4,255,62,74,6c,00,16,29,02,28,64,7e,39,30,30,30,31,36,ff,ff,ff,ff,ff,ff,02,01,ff,ff,ff,7f,ff,ff,ff,7f,ff,ff,ff,ff,ff,ff,ff,ff,ff,7f,fc,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,40,f2,b5,17,d4,34,00,00'
var INDIVIDUAL_POSITION =
  '2026-09-05-10:46:07.912,4,129808,4,255,62,78,6c,16,2d,27,18,00,79,7e,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,02,01,e0,1f,34,17,da,eb,e3,00,80,4e,1a,17,ff,ff,ff,ff,ff,7a,fc,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,80,4e,1a,17,dd,34,17,00'

function decode (line) {
  return new FromPgn({ useCamel: true }).parseString(line)
}

function valueAt (delta, path) {
  var found = delta.updates[0].values.find(pv => pv.path === path)
  return found && found.value
}

function notifications (delta) {
  return delta.updates[0].values.filter(pv =>
    pv.path.startsWith('notifications.')
  )
}

describe('129808 DSC Call Information', function () {
  it('a distress alert maps position and a nature notification', function () {
    var n2k = decode(MOB_DISTRESS)
    n2k.fields.dscMessageAddress.should.equal('5120009530')
    var delta = mapper.toDelta(n2k)

    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:512000953')
    var position = valueAt(delta, 'navigation.position')
    position.latitude.should.be.closeTo(-41.10148, 0.00001)
    position.longitude.should.be.closeTo(174.8676983, 0.00001)
    valueAt(delta, 'notifications.mob').message.should.equal(
      'DSC Distress Received! Nature of distress: mob'
    )
    delta.should.be.validSignalKDelta
  })

  it('a coast station keeps the leading zeros of its MMSI', function () {
    var n2k = decode(COAST_STATION_ALL_SHIPS)
    n2k.fields.dscMessageAddress.should.equal('0022410240')
    var delta = mapper.toDelta(n2k)

    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:002241024')
    // A safety call without a position: nothing to map but the context.
    delta.updates[0].values.should.be.empty
  })

  it('an individual call maps position without a notification', function () {
    var n2k = decode(INDIVIDUAL_POSITION)
    n2k.fields.dscMessageAddress.should.equal('2245392400')
    var delta = mapper.toDelta(n2k)

    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:224539240')
    var position = valueAt(delta, 'navigation.position')
    position.latitude.should.be.closeTo(38.9292, 0.00001)
    position.longitude.should.be.closeTo(1.493705, 0.00001)
    notifications(delta).should.be.empty
    delta.should.be.validSignalKDelta
  })

  // No capture of a relay is at hand, so this one is built and round-tripped
  // through canboatjs.
  it('a distress relay maps to the ship in distress, not the relaying station', function () {
    var delta = mapper.testToDelta({
      timestamp: '2026-10-03T12:00:00.000Z',
      prio: 4,
      src: 4,
      dst: 255,
      pgn: 129808,
      fields: {
        dscFormat: 'All ships',
        dscCategory: 'Distress',
        dscMessageAddress: '2470123450',
        natureOfDistress: 'Sinking',
        latitudeOfVesselReported: 43.5,
        longitudeOfVesselReported: 7.25,
        mmsiOfShipInDistress: '3661919100'
      }
    })

    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:366191910')
    var position = valueAt(delta, 'navigation.position')
    position.latitude.should.be.closeTo(43.5, 0.00001)
    position.longitude.should.be.closeTo(7.25, 0.00001)
    valueAt(delta, 'notifications.sinking').should.not.equal(undefined)
  })

  // Addresses canboatjs 4.0.0-beta.2 and later never give, fed to the mapper
  // directly: beta.1 gave a (garbled) number, and an address shorter than 10
  // digits would be the mistake this mapping once accepted.
  ;[
    ['a number', 3661919231],
    ['nine digits', '366191910'],
    ['all zeros', '0000000000']
  ].forEach(function ([what, address]) {
    it('drops a call whose address is ' + what, function () {
      var n2k = decode(INDIVIDUAL_POSITION)
      n2k.fields.dscMessageAddress = address
      ;(mapper.toDelta(n2k) === undefined).should.equal(true)
    })
  })
})
