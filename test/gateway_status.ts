import chai from 'chai'
chai.should()

import { FromPgn } from '@canboat/canboatjs'
const mapper = require('./testMapper')

const decode = (line: string) =>
  new FromPgn({ useCamel: true }).parseString(line)

const values = (line: string) =>
  Object.fromEntries(
    mapper
      .toDelta(decode(line))
      .updates[0].values.map((v: { path: string; value: unknown }) => [
        v.path,
        v.value
      ])
  )

describe('gateway status', function () {
  it('maps an Actisense NGT-1 system status (262386)', function () {
    // From canboat's samples/merrimac-actisense-serial-2011.raw
    const tree = values(
      '2011-04-25-06:24:59.772,0,262386,0,0,33,01,0e,00,ac,9f,01,00,00,00,00,00,02,01,00,00,00,00,00,00,00,00,00,00,00,02,01,00,03,0c,01,00,01,01'
    )
    const prefix = 'network.n2k.ngt-1.106412'
    Object.keys(tree)
      .every((p) => p.startsWith(prefix + '.'))
      .should.equal(true)
    tree.should.include({
      [`${prefix}.modelId`]: 14,
      [`${prefix}.indiChannelCount`]: 2
    })
    Object.keys(tree).should.include(`${prefix}.ch2.pointerLoading`)
  })

  it('maps a Digital Yacht iKonvert status (262400)', function () {
    // From canboat's samples/furuno-tzmap9-brightness.raw
    values(
      '2026-10-21T13:33:51.665Z,7,262400,5,255,15,02,ff,ff,ff,ff,06,d8,04,00,00,05,ff,ff,ff,ff'
    ).should.deep.equal({
      'network.n2k.ikonvert.5.canNetworkLoad': 0.02,
      'network.n2k.ikonvert.5.deviceCount': 6,
      'network.n2k.ikonvert.5.uptime': 1240,
      'network.n2k.ikonvert.5.gatewayAddress': 5
    })
  })

  it('keys an iKonvert by its source when it leaves its address out', function () {
    // From canboat's samples/sample-single.raw.txt: the gateway address is 0xff
    values(
      '2021-01-27T23:34:20.110Z,7,262400,0,255,15,12,01,00,00,00,02,1d,00,00,00,ff,ff,ff,ff,ff'
    ).should.deep.equal({
      'network.n2k.ikonvert.0.canNetworkLoad': 0.18,
      'network.n2k.ikonvert.0.errors': 1,
      'network.n2k.ikonvert.0.deviceCount': 2,
      'network.n2k.ikonvert.0.uptime': 29
    })
  })
})
