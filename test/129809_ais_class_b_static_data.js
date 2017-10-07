var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

var mapper = require('./testMapper')

describe('129809 Class B static data', function () {
  it('complete sentence converts', function () {
    var msg = JSON.parse(
      '{"timestamp":"2014-08-15-15:00:04.655","prio":"6","src":"43","dst":"255","pgn":"129809","description":"AIS Class B static data (msg 24 Part A)","fields":{"Message ID":"24","Repeat indicator":"Initial","User ID":"230044160","Name":"LAGUNA"}}'
    )
    var delta = mapper.toDelta(msg)
    delta.updates.length.should.equal(1)
    delta.context.should.equal('vessels.urn:mrn:imo:mmsi:230044160')
    delta.updates[0].values[0].path.should.equal('')
    delta.updates[0].values[0].value.name.should.equal('LAGUNA')
    var tree = mapper.toNested(msg)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
