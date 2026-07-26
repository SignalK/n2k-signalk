var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

var mapper = require('./testMapper')

describe('129802 AIS Safety Related Broadcast Message', function () {
  it('maps the broadcast text under the sending station MMSI context', function () {
    var msg = {
      timestamp: '2026-07-08-12:00:00.000',
      prio: '5',
      src: '43',
      dst: '255',
      pgn: '129802',
      description: 'AIS Safety Related Broadcast Message',
      fields: {
        'Message ID': '14',
        'Source ID': '003160001',
        'Safety Related Text': 'MAYDAY RELAY, sailing vessel Blue Heron'
      }
    }
    var delta = mapper.testToDelta(msg)

    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:003160001')

    var text = delta.updates[0].values.find(
      pathValue => pathValue.path === 'communication.ais.safetyRelatedBroadcast'
    )
    text.should.not.equal(undefined)
    text.value.should.equal('MAYDAY RELAY, sailing vessel Blue Heron')
  })

  // canboatjs cannot round-trip an empty STRING_LAU, so exercise the empty /
  // whitespace / trim handling directly against the mapping's filter+value.
  it('trims the text and skips empty broadcasts', function () {
    var mapping = require('../pgns/129802.js')
    var broadcast = mapping.find(
      m => m.node === 'communication.ais.safetyRelatedBroadcast'
    )
    broadcast
      .value({ fields: { safetyRelatedText: '  PAN PAN  ' } })
      .should.equal('PAN PAN')
    broadcast.filter({ fields: { safetyRelatedText: '' } }).should.equal(false)
    broadcast
      .filter({ fields: { safetyRelatedText: '   ' } })
      .should.equal(false)
    broadcast.filter({ fields: {} }).should.equal(false)
  })
})
