var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)
var debug = require('debug')('n2k-signalk:test:130312')
var _ = require('lodash')

describe('Temperature: ', function () {
  var n2kMapper = require('./testMapper')
  var full = new (require('@signalk/signalk-schema')).FullSignalK(
    'urn:mrn:imo:mmsi:230099999'
  )

  var testCases = require('./130310-2.json')
  Object.keys(testCases).forEach(testCaseName => {
    it(`Converts ${testCaseName}`, () => {
      const testCase = testCases[testCaseName]

      var delta = n2kMapper.toDelta(testCase)
      delta.context = 'vessels.urn:mrn:imo:mmsi:230099999'
      delta.updates[0].source.label = 'aLabel'
      full.addDelta(delta)
      delta.should.be.validSignalKDelta

      console.log(testCase)
      console.log(delta.updates[0])

      Object.keys(testCase['testExpectConvertedValues']).forEach(expectedValuePath => {
        const expectedValueFound = delta.updates[0].values.filter(value => value.path === expectedValuePath)
        expectedValueFound.length.should.equal(1, `Expected value ${expectedValuePath} not found.`)
        expectedValueFound[0].value.should.equal(testCase['testExpectConvertedValues'][expectedValuePath],
          `Value ${expectedValuePath} incorrectly converted to ${ expectedValueFound[0].value} - expected ${testCase['testExpectConvertedValues'][expectedValuePath]}`)
      })

      var fullDoc = full.retrieve()
      fullDoc.vessels['urn:mrn:imo:mmsi:230099999'].mmsi = '230099999'
      fullDoc.should.be.validSignalK
    })
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
