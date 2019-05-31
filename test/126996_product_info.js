var chai = require('chai')
chai.Should()
chai.use(require('@signalk/signalk-schema').chaiModule)

var msg = JSON.parse(
  '{"prio":6,"pgn":126996,"dst":255,"src":12,"timestamp":"2019-05-31T11:53:13.922Z","fields":{"NMEA 2000 Version":1301,"Product Code":3115,"Model ID":"UD-650","Software Version Code":"2.0.265","Model Version":"FUSION-LINK-1.0","Model Serial Code":"76223","Certification Level":1,"Load Equivalency":1},"description":"Product Information"}'
)

describe('126996 Product Information', function () {
  it('complete sentence converts to state', function () {
    const state = {}
    require('./testMapper').toNested(msg, state)
    state.should.have.property('12')
    state['12'].should.have.property('productInformation')
    const productInformation = state['12'].productInformation
    productInformation.should.have.property('productName', 'UD-650')
    productInformation.should.have.property('hardwareVersion', 'FUSION-LINK-1.0')
    productInformation.should.have.property('softwareVersion', '2.0.265')
    productInformation.should.have.property('productID', 3115)
    productInformation.should.have.property('serialNumber', '76223')
    productInformation.should.have.property('nmea2000Version', 1301)
    productInformation.should.have.property('certificationLevel', 1)
    productInformation.should.have.property('loadEquivalency', 1)
  })
})
