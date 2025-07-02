const chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

const N2kMapper = require('../dist/n2kMapper').N2kMapper

describe('Meta data works', function () {
  it('Address Claim', done => {
    const n2kMapper = new N2kMapper()
    n2kMapper.on('n2kSourceMetadata', (n2k, meta) => {
      console.log(meta)
      meta.should.have.property('uniqueNumber', 76223)
      meta.should.have.property('manufacturerCode', 'Fusion Electronics')
      meta.should.have.property('deviceFunction', 130)
      meta.should.have.property('deviceClass', 'Entertainment')
      meta.should.have.property('deviceInstanceLower', 0)
      meta.should.have.property('deviceInstanceUpper', 0)
      meta.should.have.property('systemInstance', 0)
      meta.should.have.property('canName', 'c0fa8200346129bf')
      done()
    })
    n2kMapper.toDelta({
      prio: 6,
      pgn: 60928,
      dst: 255,
      src: 12,
      timestamp: '2019-05-31T11:46:58.594Z',
      fields: {
        uniqueNumber: 76223,
        manufacturerCode: 'Fusion Electronics',
        deviceInstanceLower: 0,
        deviceInstanceUpper: 0,
        deviceFunction: 130,
        Spare: 0,
        deviceClass: 'Entertainment',
        systemInstance: 0,
        industryGroup: 'Marine',
        arbitraryAddressCapable: 1
      },
      description: 'ISO Address Claim'
    })
  })

  it('Configuration Information', done => {
    const n2kMapper = new N2kMapper()
    n2kMapper.on('n2kSourceMetadata', (n2k, meta) => {
      console.log(meta)
      meta.should.have.property('installationDescription1', 'UD-650')
      meta.should.have.property('installationDescription2', 'FUSION')
      meta.should.have.property(
        'installationDescription3',
        'Fusion Electronics Ltd'
      )
      done()
    })
    n2kMapper.toDelta({
      prio: 6,
      pgn: 126998,
      dst: 255,
      src: 12,
      timestamp: '2019-05-31T11:56:11.266Z',
      fields: {
        installationDescription1: 'UD-650',
        installationDescription2: 'FUSION',
        installationDescription3: 'Fusion Electronics Ltd'
      },
      description: 'Configuration Information'
    })
  })

  it('Product Information', done => {
    const n2kMapper = new N2kMapper()
    n2kMapper.on('n2kSourceMetadata', (n2k, meta) => {
      console.log(meta)
      meta.should.have.property('modelId', 'UD-650')
      meta.should.have.property('modelVersion', 'FUSION-LINK-1.0')
      meta.should.have.property('softwareVersionCode', '2.0.265')
      meta.should.have.property('productCode', 3115)
      meta.should.have.property('modelSerialCode', '76223')
      meta.should.have.property('nmea2000Version', 1301)
      meta.should.have.property('certificationLevel', 1)
      meta.should.have.property('loadEquivalency', 1)
      done()
    })
    n2kMapper.toDelta({
      prio: 6,
      pgn: 126996,
      dst: 255,
      src: 12,
      timestamp: '2019-05-31T11:53:13.922Z',
      fields: {
        nmea2000Version: 1301,
        productCode: 3115,
        modelId: 'UD-650',
        softwareVersionCode: '2.0.265',
        modelVersion: 'FUSION-LINK-1.0',
        modelSerialCode: '76223',
        certificationLevel: 1,
        loadEquivalency: 1
      },
      description: 'Product Information'
    })
  })
})
