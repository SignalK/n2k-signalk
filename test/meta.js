const chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

const N2kMapper = require('../n2kMapper').N2kMapper

describe('Meta data works', function () {
  
  it('Address Claim', (done) => {
    const n2kMapper = new N2kMapper()
    n2kMapper.on('n2kSourceMetadata', (n2k, meta) => {
      meta.should.have.property('uniqueId', '76223')
      meta.should.have.property('manufacturerName', 'Fusion Electronics')
      meta.should.have.property('deviceFunction', 130)
      meta.should.have.property('deviceClass', 'Entertainment')
      meta.should.have.property('deviceInstanceLower', 0)
      meta.should.have.property('deviceInstanceUpper', 0)
      meta.should.have.property('systemInstance', 0)
      meta.should.have.property('canName', '13905569736850221503')
      meta.should.have.property('deviceInstance', 0)
      done()
    })
    n2kMapper.toDelta({"prio":6,"pgn":60928,"dst":255,"src":12,"timestamp":"2019-05-31T11:46:58.594Z","fields":{"Unique Number":"76223","Manufacturer Code":"Fusion Electronics","Device Instance Lower":0,"Device Instance Upper":0,"Device Function":130,"Reserved1":"0","Device Class":"Entertainment","System Instance":0,"Industry Group":"Marine","Reserved2":"1"},"description":"ISO Address Claim"})
  })

  it('Configuration Information', (done) => {
    const n2kMapper = new N2kMapper()
    n2kMapper.on('n2kSourceMetadata', (n2k, meta) => {
      meta.should.have.property('installationNote1', 'UD-650')
      meta.should.have.property('installationNote2', 'FUSION')
      meta.should.have.property('installationNote3', 'Fusion Electronics Ltd')
      done()
    })
    n2kMapper.toDelta({"prio":6,"pgn":126998,"dst":255,"src":12,"timestamp":"2019-05-31T11:56:11.266Z","fields":{"Installation Description #1":"UD-650","Installation Description #2":"FUSION","Installation Description #3":"Fusion Electronics Ltd"},"description":"Configuration Information"})
  })

  it('Product Information', (done) => {
    const n2kMapper = new N2kMapper()
    n2kMapper.on('n2kSourceMetadata', (n2k, meta) => {
      meta.should.have.property('productName', 'UD-650')
      meta.should.have.property('hardwareVersion', 'FUSION-LINK-1.0')
      meta.should.have.property('softwareVersion', '2.0.265')
      meta.should.have.property('productID', 3115)
      meta.should.have.property('serialNumber', '76223')
      meta.should.have.property('nmea2000Version', 1301)
      meta.should.have.property('certificationLevel', 1)
      meta.should.have.property('loadEquivalency', 1)
      done()
    })
    n2kMapper.toDelta({"prio":6,"pgn":126996,"dst":255,"src":12,"timestamp":"2019-05-31T11:53:13.922Z","fields":{"NMEA 2000 Version":1301,"Product Code":3115,"Model ID":"UD-650","Software Version Code":"2.0.265","Model Version":"FUSION-LINK-1.0","Model Serial Code":"76223","Certification Level":1,"Load Equivalency":1},"description":"Product Information"})
  })
  
})
