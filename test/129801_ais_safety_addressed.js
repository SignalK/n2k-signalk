var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

var mapper = require('./testMapper')

describe('129801 AIS Addressed Safety Related Message', function () {
  it('maps the text and addressee under the sending station MMSI context', function () {
    var msg = {
      timestamp: '2026-07-08-12:00:00.000',
      prio: '5',
      src: '43',
      dst: '255',
      pgn: '129801',
      description: 'AIS Addressed Safety Related Message',
      fields: {
        'Message ID': '12',
        'Source ID': '003160001',
        'Sequence Number': '0',
        'Destination ID': '224539240',
        'Safety Related Text': 'REDUCE SPEED, DIVERS IN THE WATER'
      }
    }
    var delta = mapper.testToDelta(msg)

    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:003160001')

    var text = delta.updates[0].values.find(
      pathValue => pathValue.path === 'communication.ais.safetyRelatedAddressed'
    )
    text.should.not.equal(undefined)
    text.value.should.equal('REDUCE SPEED, DIVERS IN THE WATER')

    var addressee = delta.updates[0].values.find(
      pathValue => pathValue.path === 'communication.ais.safetyRelatedAddressee'
    )
    addressee.should.not.equal(undefined)
    addressee.value.should.equal('224539240')
  })

  // canboatjs cannot round-trip an empty STRING_LAU, so exercise the empty /
  // whitespace / trim handling directly against the mapping's filter+value.
  it('trims the text and skips empty messages', function () {
    var mapping = require('../pgns/129801.js')
    var text = mapping.find(
      m => m.node === 'communication.ais.safetyRelatedAddressed'
    )
    text
      .value({ fields: { safetyRelatedText: '  PAN PAN  ' } })
      .should.equal('PAN PAN')
    text.filter({ fields: { safetyRelatedText: '' } }).should.equal(false)
    text.filter({ fields: { safetyRelatedText: '   ' } }).should.equal(false)
    text.filter({ fields: {} }).should.equal(false)
  })

  it('pads coast station MMSIs and skips a zero addressee', function () {
    var mapping = require('../pgns/129801.js')
    var addressee = mapping.find(
      m => m.node === 'communication.ais.safetyRelatedAddressee'
    )
    addressee
      .value({ fields: { destinationId: 3160001 } })
      .should.equal('003160001')
    addressee.filter({ fields: { destinationId: 0 } }).should.equal(false)
    addressee.filter({ fields: {} }).should.equal(false)
  })
})
