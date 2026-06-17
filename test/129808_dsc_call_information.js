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
        'DSC Message Address': '366191910',
        'Nature of Distress': 'Sinking',
        'Latitude of Vessel Reported': 48.76,
        'Longitude of Vessel Reported': -123.0,
        'MMSI of Ship In Distress': '366191910'
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
        'DSC Message Address': '366191910',
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
