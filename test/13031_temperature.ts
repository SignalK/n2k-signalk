import chai from 'chai'
chai.should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)
const _ = require('lodash')
import assert from 'assert'
import testMapper = require('./testMapper')

interface PathValue {
  path: string
  value?: any
}

describe('Temperature: ', function () {
  const n2kMapper = require('./testMapper')
  const full = new (require('@signalk/signalk-schema').FullSignalK)(
    'urn:mrn:imo:mmsi:230099999'
  )

  const testCases = require('./130310-2.json')
  Object.keys(testCases).forEach((testCaseName) => {
    it(`Converts ${testCaseName}`, () => {
      const testCase = testCases[testCaseName]

      const delta = n2kMapper.testToDelta(testCase)
      delta.context = 'vessels.urn:mrn:imo:mmsi:230099999'
      delta.updates[0].source.label = 'aLabel'
      full.addDelta(delta)
      delta.should.be.validSignalKDelta

      Object.keys(testCase['testExpectConvertedValues']).forEach(
        (expectedValuePath) => {
          const expectedValueFound = delta.updates[0].values.filter(
            (value: PathValue) => value.path === expectedValuePath
          )
          expectedValueFound.length.should.equal(
            1,
            `Expected value ${expectedValuePath} not found in ${JSON.stringify(
              delta,
              null,
              2
            )}`
          )
          expectedValueFound[0].value.should.equal(
            testCase['testExpectConvertedValues'][expectedValuePath],
            `Value ${expectedValuePath} incorrectly converted to ${expectedValueFound[0].value} - expected ${testCase['testExpectConvertedValues'][expectedValuePath]}`
          )
        }
      )

      if (!testCase.notInSpec || testCase.notInSpec == false) {
        const fullDoc = full.retrieve()
        fullDoc.vessels['urn:mrn:imo:mmsi:230099999'].mmsi = '230099999'
        fullDoc.should.be.validSignalK
      }
    })
  })

  it('does not throw for PGN 130312 with empty fields (Lowrance HDS-8 / SA=3)', function () {
    // Hardware such as Lowrance HDS-8 (SA=3) can broadcast Temperature PGNs
    // with no data fields. Empty Temperature PGNs are valid on the NMEA 2000
    // bus. The handler must not throw when fields is {}.
    const delta = n2kMapper.toDelta({
      timestamp: '2024-01-01T00:00:00.000Z',
      prio: 5,
      src: 3,
      dst: 255,
      pgn: 130312,
      description: 'Temperature',
      fields: {}
    })
    assert.equal(delta.updates[0].values.length, 0)
  })

  it('all 130312 mappings are valid', function () {
    const temperatureMappings = require('../dist/temperatureMappings')
    const full = new (require('@signalk/signalk-schema').FullSignalK)(
      'urn:mrn:imo:mmsi:230099999'
    )
    _.forOwn(temperatureMappings, function (mapping: any, _key: string) {
      const path = mapping.pathWithIndex
        ? mapping.pathWithIndex
            .replace('<index>', '0')
            .replace('<engine>', 'port')
        : mapping.path

      const delta = {
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
                path,
                value: 0
              }
            ]
          }
        ]
      }
      full.addDelta(delta)
    })
    const fullDoc = full.retrieve()
    // console.log(JSON.stringify(fullDoc, null, 2));
    fullDoc.vessels['urn:mrn:imo:mmsi:230099999'].mmsi = '230099999'
    fullDoc.should.be.validSignalK
  })

  describe('in a PGN without an instance', function () {
    const temperatureMappings = require('../dist/temperatureMappings')
    const frames: Record<string, (source: string) => any> = {
      130311: (source) => ({
        pgn: 130311,
        fields: { temperatureSource: source, temperature: 300 }
      }),
      65285: (source) => ({
        pgn: 65285,
        fields: {
          manufacturerCode: 'Lowrance',
          industryCode: 'Marine Industry',
          temperatureSource: source,
          actualTemperature: 300
        }
      })
    }

    Object.entries(frames).forEach(([pgn, frame]) => {
      it(`${pgn} writes every source to its path, with no placeholder`, function () {
        Object.entries(temperatureMappings).forEach(
          ([source, mapping]: [string, any]) => {
            // The old misspelling: canboatjs can no longer encode it
            if (source === 'Refridgeration Temperature') return
            const path =
              mapping.path ??
              mapping.pathWithIndex.replace(/<index>|<engine>/, 'default')
            testMapper
              .testToDelta({
                timestamp: '2026-10-19T12:00:00.000Z',
                prio: 5,
                src: 36,
                dst: 255,
                ...frame(source)
              })
              .updates[0].values.should.deep.include({ path, value: 300 })
          }
        )
      })

      it(`${pgn} writes an exhaust gas temperature under default`, function () {
        const n2k = {
          timestamp: '2026-10-19T12:00:00.000Z',
          prio: 5,
          src: 36,
          dst: 255,
          ...frame('Exhaust Gas Temperature')
        }
        testMapper.testToDelta(n2k).updates[0].values.should.deep.include({
          path: 'propulsion.default.exhaustTemperature',
          value: 300
        })
        testMapper.toNested(n2k).should.be.validSignalKVesselIgnoringIdentity
      })
    })
  })
})
