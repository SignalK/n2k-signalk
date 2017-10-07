var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

describe('126992 system time', function () {
  it('complete sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"timestamp":"2013-10-08-16:04:06.044Z","prio":"3","src":"1","dst":"255","pgn":"126992","description":"System Time","fields":{"SID":"222","Date":"2013.10.08", "Time": "16:04:00"}}'
      )
    )
    tree.should.have.nested.property(
      'navigation.datetime.value',
      '2013-10-08T16:04:00Z'
    )
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
