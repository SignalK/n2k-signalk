var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

var msg = JSON.parse(
  '{"timestamp":"2017-04-15T15:50:48.664Z","prio":3,"src":35,"dst":255,"pgn":129029,"fields":{"SID":126,"Date":"2020.03.09","Time":"17:47:47.80000","Latitude":42.4913166,"Longitude":-70.8850733,"Altitude":41.4,"GNSS type":"GPS","Method":"DGNSS fix","Integrity":"No integrity checking","Number of SVs":10,"HDOP":0.9,"PDOP":1.6,"Geoidal Separation":-30.9,"Reference Stations":1,"list":[{"Reference Station ID":15,"Age of DGNSS Corrections": 30}]},"description":"GNSS Position Data"}'
)

// 2017-07-01T13:02:15.120Z,3,129029,1,255,43,01,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff,7f,ff,ff,ff,ff,ff,ff,ff,7f,ff,ff,ff,ff,ff,ff,ff,7f,00,fc,08,ff,7f,ff,7f,ff,ff,ff,7f,ff
const invalidDataMsg = JSON.parse(
  '{"timestamp":"2017-07-01T13:02:15.120Z","prio":3,"src":1,"dst":255,"pgn":129029,"description":"GNSS Position Data","fields":{"SID":1,"GNSS type":"GPS","Method":"no GNSS","Integrity":"No integrity checking","Number of SVs":8,"Geoidal Separation":-0.01,"list":[{}]}}'
)

describe('129029 Position Data ', function () {
  it('complete sentence converts', function () {
    var tree = require('./testMapper').toNested(msg)
    tree.navigation.position.value.longitude.should.equal(-70.8850733)
    tree.navigation.position.value.latitude.should.equal(42.4913166)
    tree.navigation.datetime.value.should.equal('2020-03-09T17:47:47.80000Z')
    tree.navigation.gnss.antennaAltitude.value.should.equal(41.4)
    tree.navigation.gnss.satellites.value.should.equal(10)
    tree.navigation.gnss.horizontalDilution.value.should.equal(0.9)
    tree.navigation.gnss.positionDilution.value.should.equal(1.6)
    tree.navigation.gnss.geoidalSeparation.value.should.equal(-30.9)
    tree.navigation.gnss.type.value.should.equal('GPS')
    tree.navigation.gnss.methodQuality.value.should.equal('DGNSS fix')
    tree.navigation.gnss.integrity.value.should.equal('no Integrity checking')

    //tree.navigation.gnss.differentialAge.value.should.equal(30)
    //tree.navigation.gnss.differentialReference.value.should.equal(22)

    tree.should.be.validSignalKVesselIgnoringIdentity
  })
  it('no position in input produces no position output', function () {
    var delta = require('./testMapper').testToDelta(invalidDataMsg)
    delta.updates[0].values.should.not.contain.a.thing.with.property(
      'path',
      'navigation.position'
    )
  })
})
