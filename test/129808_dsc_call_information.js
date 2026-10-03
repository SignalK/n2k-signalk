var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

var mapper = require('./testMapper')

describe('129808 DSC Call Information', function () {
  it('distress alert maps position and a nature notification', function () {
    var msg = {
      timestamp: '2026-06-17-12:00:00.000',
      prio: '8',
      src: '12',
      dst: '255',
      pgn: '129808',
      description: 'DSC Call Information',
      fields: {
        'DSC Format': 'Distress',
        'DSC Category': 'Distress',
        'DSC Message Address': '3661919100',
        'Nature of Distress': 'Sinking',
        'Latitude of Vessel Reported': 48.76,
        'Longitude of Vessel Reported': -123.0,
        'MMSI of Ship In Distress': '3661919100'
      }
    }
    var delta = mapper.testToDelta(msg)

    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:366191910')

    var position = delta.updates[0].values.find(
      pathValue => pathValue.path === 'navigation.position'
    )
    position.value.latitude.should.be.closeTo(48.76, 0.0001)
    position.value.longitude.should.be.closeTo(-123.0, 0.0001)

    var notification = delta.updates[0].values.find(
      pathValue => pathValue.path === 'notifications.sinking'
    )
    notification.should.not.equal(undefined)
  })

  it('non-distress call maps position without a notification', function () {
    var msg = {
      timestamp: '2026-06-17-12:00:00.000',
      prio: '8',
      src: '12',
      dst: '255',
      pgn: '129808',
      description: 'DSC Call Information',
      fields: {
        'DSC format symbol': 'All ships',
        'DSC category symbol': 'Safety',
        'DSC Message Address': '3661919100',
        'Latitude of Vessel Reported': 48.76,
        'Longitude of Vessel Reported': -123.0
      }
    }
    var delta = mapper.testToDelta(msg)

    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:366191910')

    var position = delta.updates[0].values.find(
      pathValue => pathValue.path === 'navigation.position'
    )
    position.value.latitude.should.be.closeTo(48.76, 0.0001)

    delta.updates[0].values.forEach(function (pathValue) {
      pathValue.path.startsWith('notifications.').should.equal(false)
    })
  })
})

describe('129808 DSC address', function () {
  var base = {
    timestamp: '2026-06-17-12:00:00.000',
    prio: '8',
    src: '12',
    dst: '255',
    pgn: '129808',
    description: 'DSC Call Information'
  }

  it('keeps the leading zeros of a coast station', function () {
    var delta = mapper.testToDelta({
      ...base,
      fields: {
        'DSC format symbol': 'All ships',
        'DSC category symbol': 'Safety',
        'DSC Message Address': '0023200010',
        'Latitude of Vessel Reported': 48.76,
        'Longitude of Vessel Reported': -123.0
      }
    })
    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:002320001')
  })

  // Fed to the mapper directly: canboatjs would pad or reject these.
  ;[
    ['a number', 3661919231],
    ['nine digits', '366191910'],
    ['all zeros', '0000000000']
  ].forEach(function ([what, address]) {
    it('drops a call whose address is ' + what, function () {
      var delta = mapper.toDelta({
        ...base,
        pgn: 129808,
        src: 12,
        fields: {
          dscFormatSymbol: 'All ships',
          dscCategorySymbol: 'Safety',
          dscMessageAddress: address,
          latitudeOfVesselReported: 48.76,
          longitudeOfVesselReported: -123.0
        }
      })
      ;(delta === undefined).should.equal(true)
    })
  })
})
