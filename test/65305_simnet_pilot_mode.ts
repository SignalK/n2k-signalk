import chai from 'chai'
chai.should()

import { FromPgn } from '@canboat/canboatjs'
import { N2kMapper } from '../dist/n2kMapper'

// Frames captured from Simrad autopilots, from canboat's samples/.
function values (line: string): any[] {
  const n2k = new FromPgn({ useCamel: true }).parseString(line) as any
  return new N2kMapper().toDelta(n2k)!.updates[0].values
}

describe('65305 Simnet pilot mode', function () {
  const cases = [
    // [file, line, state]
    [
      'ap48-tack.all',
      '2026-07-05T00:07:13.054Z,1,65305,19,255,8,41,9f,64,0a,08,00,00,00',
      'standby'
    ],
    [
      'ap48-tack.all',
      '2026-07-05T00:07:25.129Z,1,65305,19,255,8,41,9f,64,0a,10,00,00,00',
      'heading'
    ],
    [
      'ap48-tack.all',
      '2026-07-05T00:04:57.900Z,1,65305,19,255,8,41,9f,64,0a,00,04,00,00',
      'wind'
    ],
    [
      'maneuvers.raw',
      '2026-07-10T06:27:57.786Z,1,65305,19,255,8,41,9f,64,0a,40,00,00,00',
      'route'
    ],
    // An AC computer sets a mode bit canboat does not name alongside it.
    [
      'ac42-commissioning.raw',
      '2026-06-08T01:52:13.153,7,65305,13,255,8,41,9f,00,0a,0a,00,80,00',
      'standby'
    ],
    [
      'ac42-commissioning.raw',
      '2026-06-08T01:59:43.385,7,65305,13,255,8,41,9f,00,0a,14,00,80,00',
      'heading'
    ]
  ]
  cases.forEach(([file, line, state]) => {
    it(`writes ${state} for a pilot mode frame from ${file}`, function () {
      values(line).should.deep.equal([
        { path: 'steering.autopilot.state', value: state }
      ])
    })
  })

  it('writes nothing for the other 65305 variants', function () {
    ;[
      // Device status, mode request, status request, sailing processor
      // status and the range's catch-all.
      '2026-07-05T00:04:57.900Z,1,65305,19,255,8,41,9f,64,02,10,00,00,00',
      '2026-06-08T01:55:23.891,7,65305,21,255,8,41,9f,01,0b,00,00,00,00',
      '2026-06-08T01:55:24.435,7,65305,21,255,8,41,9f,01,03,00,00,00,00',
      '2026-07-05T00:04:57.703Z,7,65305,38,255,8,41,9f,01,17,18,09,00,00',
      '2026-06-08T01:55:43.727,7,65305,13,255,8,41,9f,00,1e,02,00,00,00'
    ].forEach(line => values(line).should.deep.equal([]))
  })
})
