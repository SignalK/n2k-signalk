import chai from 'chai'
chai.should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)
import testMapper = require('./testMapper')
import { FromPgn } from '@canboat/canboatjs'
import { N2kMapper } from '../dist/n2kMapper'

describe('130845 Simrad Displays', function () {
  it('birghtness converts', function () {
    const tree = testMapper.toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:49.048Z","prio":7,"src":115,"dst":255,"pgn":130845,"fields":{"Manufacturer Code":"Simrad","Industry Code":"Marine Industry","Display Group": "Group 1", "Network Group": "Group 1", "Key":"Backlight level","Value":"50%"}}'
      )
    )
    tree.should.have.nested.property(
      'electrical.displays.navico.group1.brightness.value',
      0.5
    )
  })

  it('night mode converts', function () {
    const tree = testMapper.toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:49.048Z","prio":7,"src":115,"dst":255,"pgn":130845,"fields":{"Manufacturer Code":"Simrad","Industry Code":"Marine Industry","Display Group": "Group 1", "Network Group": "Group 1", "Key":"Night mode","Value":4}}'
      )
    )
    tree.should.have.nested.property(
      'electrical.displays.navico.group1.nightMode.state.value',
      1
    )
  })

  it('night mode color converts', function () {
    const tree = testMapper.toNested(
      JSON.parse(
        '{"timestamp":"2016-10-18T15:52:49.048Z","prio":7,"src":115,"dst":255,"pgn":130845,"fields":{"Manufacturer Code":"Simrad","Industry Code":"Marine Industry","Display Group": "Group 1", "Network Group": "Group 1", "Key":"Night mode color","Value":1}}'
      )
    )
    tree.should.have.nested.property(
      'electrical.displays.navico.group1.nightModeColor.value',
      'green'
    )
  })
})

describe('130845 Simrad displays, captured frames', function () {
  // Frames captured from Simrad displays, from canboat's samples/.
  function values (line: string): any[] {
    const n2k = new FromPgn({ useCamel: true }).parseString(line) as any
    return new N2kMapper().toDelta(n2k)!.updates[0].values
  }
  const brightness = (value: number) => [
    { path: 'electrical.displays.navico.default.brightness', value }
  ]

  it('takes a labelled backlight level as its percentage', function () {
    // ac42-commissioning.raw: 30%, 10% (Min), 100% (Max)
    values(
      '2026-06-08T01:54:18.370,3,130845,21,255,14,41,9f,ff,ff,01,ff,ff,12,00,01,16,ff,ff,ff'
    ).should.deep.equal(brightness(0.3))
    values(
      '2026-06-08T01:54:19.614,3,130845,21,255,14,41,9f,ff,ff,01,ff,ff,12,00,01,00,ff,ff,ff'
    ).should.deep.equal(brightness(0.1))
    values(
      '2026-06-08T01:54:24.746,3,130845,21,255,14,41,9f,ff,ff,01,ff,ff,12,00,01,63,ff,ff,ff'
    ).should.deep.equal(brightness(1))
  })

  it('takes a level between the steps on a 0-99 scale', function () {
    // navico-source-selection.raw: 64
    values(
      '2026-06-08T07:34:32.488,3,130845,32,255,14,41,9f,ff,ff,01,ff,ff,12,00,01,40,ff,ff,ff'
    ).should.deep.equal(brightness(64 / 99))
  })

  it('writes day mode as nightMode.state 0', function () {
    // ac42-commissioning.raw
    values(
      '2026-06-08T01:54:33.543,3,130845,21,255,14,41,9f,ff,ff,01,ff,ff,26,00,01,02,ff,ff,ff'
    ).should.deep.equal([
      { path: 'electrical.displays.navico.default.nightMode.state', value: 0 }
    ])
  })
})
