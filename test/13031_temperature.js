var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)
var debug = require('debug')('n2k-signalk:test:130312')
var _ = require('lodash')

var msgs = require('./130310-2.json')

describe('Temperature: ', function () {
  it('examples work', function () {
    var n2kMapper = require('./testMapper')
    var full = new (require('@signalk/signalk-schema')).FullSignalK(
      'urn:mrn:imo:mmsi:230099999'
    )
    _.forOwn(msgs, function (msg, key) {
      var delta = n2kMapper.toDelta(msg)
      delta.context = 'vessels.urn:mrn:imo:mmsi:230099999'
      delta.updates[0].source.label = 'aLabel'
      full.addDelta(delta)
      delta.should.be.validSignalKDelta
      delta.updates[0].values.forEach(function (pathValue) {})
    })
    var fullDoc = full.retrieve()
    fullDoc.vessels['urn:mrn:imo:mmsi:230099999'].mmsi = '230099999'
    fullDoc.should.be.validSignalK
  })

  it('all 130312 mappings are valid', function () {
    var temperatureMappings = require('../temperatureMappings')
    var full = new (require('@signalk/signalk-schema')).FullSignalK(
      'urn:mrn:imo:mmsi:230099999'
    )
    _.forOwn(temperatureMappings, function (mapping, key) {
      var delta = {
        context: 'vessels.urn:mrn:imo:mmsi:230099999',
        updates: [
          {
            source: {
              label: '',
              type: 'NMEA2000',
              pgn: 130312,
              src: '36',
              instance: '0'
            },
            timestamp: '2016-10-18T15:52:48.152Z',
            values: [
              {
                path: mapping.path,
                value: 0
              }
            ]
          }
        ]
      }
      full.addDelta(delta)
    })
    var fullDoc = full.retrieve()
    // console.log(JSON.stringify(fullDoc, null, 2));
    fullDoc.vessels['urn:mrn:imo:mmsi:230099999'].mmsi = '230099999'
    fullDoc.should.be.validSignalK
  })
})
