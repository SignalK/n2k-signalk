const chai = require('chai')
chai.Should()

const { toDeltaTransformer } = require('../dist/n2kMapper')

describe('toDeltaTransformer', function () {
  it('emits nothing for a report toDelta drops', function (done) {
    const stream = toDeltaTransformer({}, {})
    const emitted = []
    stream.on('data', d => emitted.push(d))
    stream.on('end', () => {
      emitted.should.have.lengthOf(0)
      done()
    })
    // An AIS position report without an MMSI: canboat and canboatjs report
    // MMSI 0 as not available, so userId is absent.
    stream.write({
      pgn: 129038,
      src: 3,
      dst: 255,
      prio: 4,
      timestamp: '2022-05-09T13:38:38.917Z',
      fields: {
        messageId: 'Scheduled Class A position report',
        longitude: 10.15,
        latitude: 54.36
      }
    })
    stream.end()
  })
})
