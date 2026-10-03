var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)
var debug = require('debug')('n2k-signalk:test:130314')
var _ = require('lodash')

describe('Pressure: ', function () {
  var n2kMapper = require('./testMapper')
  var full = new (require('@signalk/signalk-schema').FullSignalK)(
    'urn:mrn:imo:mmsi:230099999'
  )

  var testCases = require('./130314-data.json')
  Object.keys(testCases).forEach(testCaseName => {
    it(`Converts ${testCaseName}`, () => {
      const testCase = testCases[testCaseName]

      var delta = n2kMapper.testToDelta(testCase)
      delta.context = 'vessels.urn:mrn:imo:mmsi:230099999'
      delta.updates[0].source.label = 'aLabel'
      full.addDelta(delta)
      delta.should.be.validSignalKDelta
      // The server discards a whole update if any value lacks a path
      delta.updates.forEach(update =>
        update.values.forEach(value => value.path.should.be.a('string'))
      )

      Object.keys(testCase['testExpectConvertedValues']).forEach(
        expectedValuePath => {
          const expectedValueFound = delta.updates[0].values.filter(
            value => value.path === expectedValuePath
          )
          expectedValueFound.length.should.equal(
            1,
            `Expected value ${expectedValuePath} not found.`
          )
          expectedValueFound[0].value.should.equal(
            testCase['testExpectConvertedValues'][expectedValuePath],
            `Value ${expectedValuePath} incorrectly converted to ${expectedValueFound[0].value} - expected ${testCase['testExpectConvertedValues'][expectedValuePath]}`
          )
        }
      )

      var fullDoc = full.retrieve()
      fullDoc.vessels['urn:mrn:imo:mmsi:230099999'].mmsi = '230099999'
      //fullDoc.should.be.validSignalK
    })
  })

  it('leaves out a pressure it has no path for, and says so once', function () {
    const report = {
      timestamp: '2015-01-15-16:15:21.862Z',
      prio: '5',
      src: '90',
      dst: '255',
      pgn: '130314',
      description: 'Actual Pressure',
      fields: { SID: 176, Instance: 0, Pressure: 101300 }
    }
    const logged = []
    const consoleError = console.error
    console.error = (...args) => logged.push(args.join(' '))
    let deltas
    try {
      deltas = [n2kMapper.testToDelta(report), n2kMapper.testToDelta(report)]
    } finally {
      console.error = consoleError
    }
    // Its only value has no path, so nothing is emitted for it.
    deltas.forEach(delta => delta.updates[0].values.should.be.empty)
    logged.length.should.equal(1)
    logged[0].should.contain('pgn 130314 from src 90')
  })

  it('all 130314 mappings are valid', function () {
    var pressureMappings = require('../pressureMappings')
    var full = new (require('@signalk/signalk-schema').FullSignalK)(
      'urn:mrn:imo:mmsi:230099999'
    )
    _.forOwn(pressureMappings, function (mapping, key) {
      var delta = {
        context: 'vessels.urn:mrn:imo:mmsi:230099999',
        updates: [
          {
            source: {
              label: '',
              type: 'NMEA2000',
              pgn: 130314,
              src: '88',
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
    //fullDoc.should.be.validSignalK
  })
})
