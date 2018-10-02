var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('130314_pressure', function () {
  it('complete sentence converts', function () {
    const json = '{"timestamp":"2016-04-09T16:41:39.364Z","prio":5,"src":28,"dst":255,"pgn":130314,"description":"Actual Pressure","fields":{"SID":0,"Pressure Instance":0,"Pressure Source":"Atmospheric","Pressure":100578}}'
    const pgns = [ json, json.replace('Pressure Instance', 'Pressure') ]
    pgns.forEach(pgn => {
    var tree = require('./testMapper').toNested(
      JSON.parse(pgn)
    )
    tree.should.have.nested.property('environment.outside.pressure.value', 100578)
      tree.should.be.validSignalKVesselIgnoringIdentity
    })
  })
})
