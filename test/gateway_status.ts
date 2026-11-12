import chai from 'chai'
chai.should()

import { FromPgn } from '@canboat/canboatjs'
import { N2kMapper } from '../dist/n2kMapper'

const decode = (line: string) =>
  new FromPgn({ useCamel: true }).parseString(line)

const values = (mapper: N2kMapper, line: string) =>
  Object.fromEntries(
    (mapper.toDelta(decode(line) as any)?.updates[0].values ?? []).map(
      (v: { path: string; value: unknown }) => [v.path, v.value]
    )
  )

// From canboat's samples/furuno-tzmap9-brightness.raw
const IKONVERT =
  '2026-10-21T13:33:51.665Z,7,262400,5,255,15,02,ff,ff,ff,ff,06,d8,04,00,00,05,ff,ff,ff,ff'

describe('gateway network status (262400)', function () {
  it("writes the gateway's status under its connection", function () {
    values(
      new N2kMapper({ providerId: 'ikonvert' }),
      IKONVERT
    ).should.deep.equal({
      'providers.ikonvert.canNetworkLoad': 0.02,
      'providers.ikonvert.deviceCount': 6,
      'providers.ikonvert.uptime': 1240,
      'providers.ikonvert.gatewayAddress': 5
    })
  })

  it('leaves out what the gateway does not send', function () {
    // From canboat's samples/sample-single.raw.txt: no gateway address
    values(
      new N2kMapper({ providerId: 'ikonvert' }),
      '2021-01-27T23:34:20.110Z,7,262400,0,255,15,12,01,00,00,00,02,1d,00,00,00,ff,ff,ff,ff,ff'
    ).should.deep.equal({
      'providers.ikonvert.canNetworkLoad': 0.18,
      'providers.ikonvert.errors': 1,
      'providers.ikonvert.deviceCount': 2,
      'providers.ikonvert.uptime': 29
    })
  })

  it('leaves out a network load above 100 %', function () {
    // IKONVERT with a load of 101
    values(
      new N2kMapper({ providerId: 'ikonvert' }),
      IKONVERT.replace(',15,02,', ',15,65,')
    ).should.not.have.property('providers.ikonvert.canNetworkLoad')
  })

  it('writes nothing without a provider id', function () {
    values(new N2kMapper(), IKONVERT).should.deep.equal({})
  })

  it("writes nothing for an Actisense NGT-1's own status (262386)", function () {
    // From canboat's samples/merrimac-actisense-serial-2011.raw
    values(
      new N2kMapper({ providerId: 'ngt1' }),
      '2011-04-25-06:24:59.772,0,262386,0,0,33,01,0e,00,ac,9f,01,00,00,00,00,00,02,01,00,00,00,00,00,00,00,00,00,00,00,02,01,00,03,0c,01,00,01,01'
    ).should.deep.equal({})
  })
})
