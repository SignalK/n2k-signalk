var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('signalk-schema').chaiModule)

describe('130820 Fusion Stereo', function () {
  it('complet device name sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-11-26T20:40:00.895Z","prio":7,"src":10,"dst":255,"pgn":130820,"description":"Fusion: Unit Name","fields":{"Manufacturer Code":"Fusion","Industry Code":"Marine Industry","Message ID":"Unit Name","A":128,"Name":"Fusion"}}'
      )
    )
    // tree.should.be.validSignalKVesselIgnoringIdentity;
  })

  it('complet current source sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-11-26T20:40:00.901Z","prio":7,"src":10,"dst":255,"pgn":130820,"description":"Fusion: Source Name","fields":{"Manufacturer Code":"Fusion","Industry Code":"Marine Industry","Message ID":"Source","A":128,"Source ID":4,"Current Source ID":4,"D":3,"E":5,"Source":"SiriusXM"}}'
      )
    )
    tree.should.have.nested.property(
      'entertainment.device.fusion1.output.zone2.source.value',
      'entertainment.device.fusion1.avsource.source4'
    )
    tree.should.have.nested.property(
      'entertainment.device.fusion1.avsource.source4.name.value',
      'SiriusXM'
    )
    // tree.should.be.validSignalKVesselIgnoringIdentity;
  })

  it('complet SiriusXM channel sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-11-26T20:40:00.906Z","prio":7,"src":10,"dst":255,"pgn":130820,"description":"Fusion: SiriusXM Channel","fields":{"Manufacturer Code":"Fusion","Industry Code":"Marine Industry","Message ID":"SiriusXM Channel","A":6554752,"Channel":"xL Howard 100"}}'
      )
    )
    tree.should.have.nested.property(
      'entertainment.device.fusion1.avsource.source4.tuner.stationName.value',
      'xL Howard 100'
    )
    // tree.should.be.validSignalKVesselIgnoringIdentity;
  })

  it('complet SiriusXM Genre sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-11-26T20:40:00.911Z","prio":7,"src":10,"dst":255,"pgn":130820,"description":"Fusion: SiriusXM Genre","fields":{"Manufacturer Code":"Fusion","Industry Code":"Marine Industry","Message ID":"SiriusXM Genre","A":6554752,"Genre":"Howard Stern"}}'
      )
    )
    tree.should.have.nested.property(
      'entertainment.device.fusion1.avsource.source4.track.genre.value',
      'Howard Stern'
    )
    // tree.should.be.validSignalKVesselIgnoringIdentity;
  })

  it('complet SiriusXM title sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-11-26T20:40:00.915Z","prio":7,"src":10,"dst":255,"pgn":130820,"description":"Fusion: SiriusXM Title","fields":{"Manufacturer Code":"Fusion","Industry Code":"Marine Industry","Message ID":"SiriusXM Title","A":6554752,"Title":"A title"}}'
      )
    )
    tree.should.have.nested.property(
      'entertainment.device.fusion1.avsource.source4.track.name.value',
      'A title'
    )
    // tree.should.be.validSignalKVesselIgnoringIdentity;
  })

  it('complet SiriusXM Artist sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-11-26T20:40:00.918Z","prio":7,"src":10,"dst":255,"pgn":130820,"description":"Fusion: SiriusXM Artist","fields":{"Manufacturer Code":"Fusion","Industry Code":"Marine Industry","Message ID":"SiriusXM Artist","A":6554752,"Artist":"Howard Stern"}}'
      )
    )
    tree.should.have.nested.property(
      'entertainment.device.fusion1.avsource.source4.track.artistName.value',
      'Howard Stern'
    )
    // tree.should.be.validSignalKVesselIgnoringIdentity;
  })

  it('complet mute sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-11-26T20:40:00.973Z","prio":7,"src":10,"dst":255,"pgn":130820,"description":"Fusion: Mute","fields":{"Manufacturer Code":"Fusion","Industry Code":"Marine Industry","Message ID":"Mute","A":128,"Mute":"Not Muted"}}'
      )
    )
    tree.should.have.nested.property(
      'entertainment.device.fusion1.output.zone1.isMuted.value',
      false
    )
    // tree.should.be.validSignalKVesselIgnoringIdentity;
  })

  it('complete equalizer sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-11-26T20:40:00.986Z","prio":7,"src":10,"dst":255,"pgn":130820,"description":"Fusion: Tone","fields":{"Manufacturer Code":"Fusion","Industry Code":"Marine Industry","Message ID":"Tone","A":128,"B":3,"Bass":1,"Mid":2,"Treble":3}}'
      )
    )
    tree.should.have.nested.property(
      'entertainment.device.fusion1.output.zone1.equalizer.bass',
      1
    )
    tree.should.have.nested.property(
      'entertainment.device.fusion1.output.zone1.equalizer.mid',
      2
    )
    tree.should.have.nested.property(
      'entertainment.device.fusion1.output.zone1.equalizer.treble',
      3
    )
    // tree.should.be.validSignalKVesselIgnoringIdentity;
  })

  it('complet volume sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-11-26T20:40:00.991Z","prio":7,"src":10,"dst":255,"pgn":130820,"description":"Fusion: Volume","fields":{"Manufacturer Code":"Fusion","Industry Code":"Marine Industry","Message ID":"Volume","A":128,"Zone 1":10,"Zone 2":11,"Zone 3":12,"Zone 4":13}}'
      )
    )
    tree.should.have.nested.property(
      'entertainment.device.fusion1.output.zone1.volume.master.value',
      10
    )
    tree.should.have.nested.property(
      'entertainment.device.fusion1.output.zone2.volume.master.value',
      11
    )
    tree.should.have.nested.property(
      'entertainment.device.fusion1.output.zone3.volume.master.value',
      12
    )
    tree.should.have.nested.property(
      'entertainment.device.fusion1.output.zone4.volume.master.value',
      13
    )
    // tree.should.be.validSignalKVesselIgnoringIdentity;
  })

  it('complet zone name sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-11-26T20:40:00.996Z","prio":7,"src":10,"dst":255,"pgn":130820,"description":"Fusion: Zone Name","fields":{"Manufacturer Code":"Fusion","Industry Code":"Marine Industry","Message ID":"Zone Name","A":128,"Number":0,"Name":"Cockpit"}}'
      )
    )
    tree.should.have.nested.property(
      'entertainment.device.fusion1.output.zone1.name.value',
      'Cockpit'
    )
    // tree.should.be.validSignalKVesselIgnoringIdentity;
  })

  it('complet track name sentence converts', function () {
    var tree = require('../n2kMapper.js').toNested(
      JSON.parse(
        '{"timestamp":"2016-11-12T20:26:52.150Z","prio":7,"src":10,"dst":255,"pgn":130820,"description":"Fusion: Track","fields":{"Manufacturer Code":"Fusion","Industry Code":"Marine Industry","Message ID":"Track Title","A":128,"B":3592,"Track":"Flow"}}'
      )
    )
    tree.should.have.nested.property(
      'entertainment.device.fusion1.avsource.source4.track.name.value',
      'Flow'
    )
    // tree.should.be.validSignalKVesselIgnoringIdentity;
  })
})
