var chai = require('chai')
chai.Should()
chai.use(require('@signalk/signalk-schema').chaiModule)

var msg = JSON.parse(
  '{"prio":6,"pgn":126998,"dst":255,"src":12,"timestamp":"2019-05-31T11:56:11.266Z","fields":{"Installation Description #1":"UD-650","Installation Description #2":"FUSION","Installation Description #3":"Fusion Electronics Ltd"},"description":"Configuration Information"}'
)

describe('126998 Configuration Information ', function () {
  it('complete sentence converts to state', function () {
    const state = {}
    require('./testMapper').toNested(msg, state)
    state.should.have.property('12')
    state['12'].should.have.property('configurationInformation')
    const configurationInformation = state['12'].configurationInformation
    configurationInformation.should.have.property('installationNote1', 'UD-650')
    configurationInformation.should.have.property('installationNote2', 'FUSION')
    configurationInformation.should.have.property('installationNote3', 'Fusion Electronics Ltd')
  })
})
