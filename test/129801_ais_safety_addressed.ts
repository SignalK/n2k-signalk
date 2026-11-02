import chai from 'chai'
chai.should()
chai.use(require('chai-things'))

const mapper = require('./testMapper')

// A value of a delta, as the tests read it.
interface PathValue {
  path: string
  value?: any
}

describe('129801 AIS Addressed Safety Related Message', function () {
  it('maps the text and addressee as one value under the sending station MMSI context', function () {
    const msg = {
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
    const delta = mapper.testToDelta(msg)

    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:003160001')

    const message = delta.updates[0].values.find(
      (pathValue: PathValue) =>
        pathValue.path === 'communication.ais.safetyRelatedAddressed'
    )
    message.should.not.equal(undefined)
    message.value.should.deep.equal({
      text: 'REDUCE SPEED, DIVERS IN THE WATER',
      addressee: '224539240'
    })
    delta.updates[0].values
      .filter((pathValue: PathValue) =>
        pathValue.path.startsWith('communication.ais.')
      )
      .length.should.equal(1)
  })

  // canboatjs cannot round-trip an empty STRING_LAU, so exercise the empty /
  // whitespace / trim handling directly against the mapping's filter+value.
  it('trims the text and skips empty messages', function () {
    const mapping = require('../dist/pgns/129801.js')
    const text = mapping.find(
      (m: { node?: string }) =>
        m.node === 'communication.ais.safetyRelatedAddressed'
    )
    text
      .value({ fields: { safetyRelatedText: '  PAN PAN  ' } })
      .text.should.equal('PAN PAN')
    text.filter({ fields: { safetyRelatedText: '' } }).should.equal(false)
    text.filter({ fields: { safetyRelatedText: '   ' } }).should.equal(false)
    text.filter({ fields: {} }).should.equal(false)
  })

  it('pads coast station MMSIs and leaves out a zero addressee', function () {
    const mapping = require('../dist/pgns/129801.js')
    const message = mapping.find(
      (m: { node?: string }) =>
        m.node === 'communication.ais.safetyRelatedAddressed'
    )
    message
      .value({ fields: { safetyRelatedText: 'X', destinationId: 3160001 } })
      .should.deep.equal({ text: 'X', addressee: '003160001' })
    message
      .value({ fields: { safetyRelatedText: 'X', destinationId: 0 } })
      .should.deep.equal({ text: 'X' })
    message
      .value({ fields: { safetyRelatedText: 'X' } })
      .should.deep.equal({ text: 'X' })
  })
})
