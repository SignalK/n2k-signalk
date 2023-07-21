const chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

const { toDelta } = require('../n2kMapper')

describe('129540 satellites in view', function () {
  it('converts', () => {
    const input = JSON.parse(
      '{"prio":6,"pgn":129540,"dst":255,"src":1,"timestamp":"2021-05-19T09:46:23.465Z","input":["2021-05-19T09:46:23.442Z,6,129540,1,255,8,00,93,01,fe,0c,02,d0,24","2021-05-19T09:46:23.442Z,6,129540,1,255,8,01,fe,3b,cc,10,00,00,00","2021-05-19T09:46:23.443Z,6,129540,1,255,8,02,00,f0,04,2e,08,9e,ee","2021-05-19T09:46:23.443Z,6,129540,1,255,8,03,00,00,00,00,00,00,f0","2021-05-19T09:46:23.444Z,6,129540,1,255,8,04,05,74,05,67,4e,ac,0d","2021-05-19T09:46:23.444Z,6,129540,1,255,8,05,00,00,00,00,f0,06,d1","2021-05-19T09:46:23.444Z,6,129540,1,255,8,06,06,2e,17,e4,0c,00,00","2021-05-19T09:46:23.445Z,6,129540,1,255,8,07,00,00,f0,0c,c5,13,2d","2021-05-19T09:46:23.445Z,6,129540,1,255,8,08,53,e4,0c,00,00,00,00","2021-05-19T09:46:23.445Z,6,129540,1,255,8,09,f0,0e,c5,04,94,b0,00","2021-05-19T09:46:23.446Z,6,129540,1,255,8,0a,00,00,00,00,00,f0,19","2021-05-19T09:46:23.446Z,6,129540,1,255,8,0b,73,32,cf,6f,a0,0f,00","2021-05-19T09:46:23.446Z,6,129540,1,255,8,0c,00,00,00,f0,1a,dc,08","2021-05-19T09:46:23.447Z,6,129540,1,255,8,0d,1f,c9,00,00,00,00,00","2021-05-19T09:46:23.447Z,6,129540,1,255,8,0e,00,f0,1d,d0,24,88,9f","2021-05-19T09:46:23.461Z,6,129540,1,255,8,0f,3c,0f,00,00,00,00,f0","2021-05-19T09:46:23.462Z,6,129540,1,255,8,10,1f,5c,1f,36,be,10,0e","2021-05-19T09:46:23.462Z,6,129540,1,255,8,11,00,00,00,00,f0,52,39","2021-05-19T09:46:23.463Z,6,129540,1,255,8,12,28,14,8b,00,00,00,00","2021-05-19T09:46:23.464Z,6,129540,1,255,8,13,00,00,f0,49,16,13,70","2021-05-19T09:46:23.464Z,6,129540,1,255,8,14,d7,00,00,00,00,00,00","2021-05-19T09:46:23.465Z,6,129540,1,255,8,15,f0,ff,ff,ff,ff,ff,ff"],"fields":{"SID":1,"Mode":2,"Sats in View":12,"list":[{"PRN":2,"Elevation":0.9424,"Azimuth":1.5358,"SNR":43,"Range residuals":0,"Status":"Not tracked"},{"PRN":4,"Elevation":0.2094,"Azimuth":6.1086,"SNR":0,"Range residuals":0,"Status":"Not tracked"},{"PRN":5,"Elevation":0.1396,"Azimuth":2.0071,"SNR":35,"Range residuals":0,"Status":"Not tracked"},{"PRN":6,"Elevation":0.1745,"Azimuth":0.5934,"SNR":33,"Range residuals":0,"Status":"Not tracked"},{"PRN":12,"Elevation":0.5061,"Azimuth":2.1293,"SNR":33,"Range residuals":0,"Status":"Not tracked"},{"PRN":14,"Elevation":0.1221,"Azimuth":4.5204,"SNR":0,"Range residuals":0,"Status":"Not tracked"},{"PRN":25,"Elevation":1.2915,"Azimuth":2.8623,"SNR":40,"Range residuals":0,"Status":"Not tracked"},{"PRN":26,"Elevation":0.2268,"Azimuth":5.1487,"SNR":0,"Range residuals":0,"Status":"Not tracked"},{"PRN":29,"Elevation":0.9424,"Azimuth":4.084,"SNR":39,"Range residuals":0,"Status":"Not tracked"},{"PRN":31,"Elevation":0.8028,"Azimuth":4.8694,"SNR":36,"Range residuals":0,"Status":"Not tracked"},{"PRN":82,"Elevation":1.0297,"Azimuth":3.5604,"SNR":0,"Range residuals":0,"Status":"Not tracked"},{"PRN":73,"Elevation":0.4886,"Azimuth":5.5152,"SNR":0,"Range residuals":0,"Status":"Not tracked"},{"SNR":2.55}]},"description":"GNSS Sats in View"}'
    )
    const delta = toDelta(input)
    const pathValue = delta.updates[0].values[0]
    pathValue.value.count.should.equal(12)
    pathValue.path.should.equal('navigation.gnss.satellitesInView')
    pathValue.value.satellites[0].should.deep.equal({
      id: 2,
      SNR: 43,
      azimuth: 1.5358,
      elevation: 0.9424
    })
  })
})
