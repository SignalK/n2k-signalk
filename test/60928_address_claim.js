var chai = require('chai')
chai.Should()
chai.use(require('@signalk/signalk-schema').chaiModule)

var msg = JSON.parse(
  '{"prio":6,"pgn":60928,"dst":255,"src":12,"timestamp":"2019-05-31T11:46:58.594Z","fields":{"Unique Number":"76223","Manufacturer Code":"Fusion Electronics","Device Instance Lower":0,"Device Instance Upper":0,"Device Function":130,"Reserved1":"0","Device Class":"Entertainment","System Instance":0,"Industry Group":"Marine","Reserved2":"1"},"description":"ISO Address Claim"}'
)

describe('60928 ISO Address Claim', function () {
  it('complete sentence converts to state', function () {
    const state = {}
    require('./testMapper').toNested(msg, state)
    state.should.have.property('12')
    state['12'].should.have.property('deviceInformation')
    const deviceInformation = state['12'].deviceInformation
    deviceInformation.should.have.property('uniqueId', '76223')
    deviceInformation.should.have.property('manufacturerName', 'Fusion Electronics')
    deviceInformation.should.have.property('deviceFunction', 130)
    deviceInformation.should.have.property('deviceClass', 'Entertainment')
    deviceInformation.should.have.property('deviceInstanceLower', 0)
    deviceInformation.should.have.property('deviceInstanceUpper', 0)
    deviceInformation.should.have.property('systemInstance', 0)
  })
})
