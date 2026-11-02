import chai from 'chai'
chai.should()
chai.use(require('@signalk/signalk-schema').chaiModule)

import { FromPgn } from '@canboat/canboatjs'
import { N2kMapper } from '../dist/n2kMapper'

function values (n2k: any): any[] {
  return new N2kMapper().toDelta(n2k)!.updates[0].values
}

// Alarms captured from Simrad equipment, from canboat's samples/, as
// canboat's analyzer decodes them (analyzer -json -camel). canboatjs
// decodes these frames as Simnet: Event instead, so they go to the mapper
// as canboat decodes them.
const headingMissing = {
  timestamp: '2026-06-08T02:27:11.485Z',
  prio: 2,
  src: 22,
  dst: 255,
  pgn: 130850,
  description: 'Simnet: Alarm',
  fields: {
    manufacturerCode: 'Simrad',
    industryCode: 'Marine Industry',
    address: 255,
    networkGroup: 'Default',
    eventType: 'Alarm',
    command: 'Activate',
    alarmId: 'Heading missing',
    f: 1,
    g: 0
  }
} // nac3-operations.raw
const engineLowOilPressure = {
  timestamp: '2026-07-05T00:05:34.552Z',
  prio: 2,
  src: 19,
  dst: 255,
  pgn: 130850,
  description: 'Simnet: Alarm',
  fields: {
    manufacturerCode: 'Simrad',
    industryCode: 'Marine Industry',
    address: 255,
    networkGroup: 'Default',
    eventType: 'Alarm',
    command: 'Activate',
    alarmId: 'Engine low oil pressure',
    f: 3,
    g: 0
  }
} // ap48-tack.all
const xte = {
  timestamp: '2026-07-05T00:05:41.551Z',
  prio: 2,
  src: 19,
  dst: 255,
  pgn: 130850,
  description: 'Simnet: Alarm',
  fields: {
    manufacturerCode: 'Simrad',
    industryCode: 'Marine Industry',
    address: 255,
    networkGroup: 'Default',
    eventType: 'Alarm',
    command: 'Activate',
    alarmId: 'XTE',
    f: 2,
    g: 0
  }
} // ap48-tack.all

describe('130850 Simnet alarm', function () {
  it('writes an alarm as a notification named after it', function () {
    values(headingMissing).should.deep.equal([
      {
        path: 'notifications.headingMissing',
        value: {
          message: 'Heading missing',
          method: ['visual'],
          state: 'warning',
          timestamp: '2026-06-08T02:27:11.485Z'
        }
      }
    ])
    values(engineLowOilPressure)[0].path.should.equal(
      'notifications.engineLowOilPressure'
    )
    values(xte)[0].path.should.equal('notifications.xte')
  })

  it('writes an unnamed alarm as unknown<id>', function () {
    // No capture of an alarm id canboat does not name is available.
    const unnamed = JSON.parse(JSON.stringify(headingMissing))
    unnamed.fields.alarmId = 999
    values(unnamed).should.deep.equal([
      {
        path: 'notifications.unknown999',
        value: {
          message: 'Unknown Simnet Alarm 999',
          method: ['visual'],
          state: 'warning',
          timestamp: '2026-06-08T02:27:11.485Z'
        }
      }
    ])
  })

  it('writes a valid Signal K notification', function () {
    const delta = new N2kMapper().toDelta(headingMissing)!
    delta.context = 'vessels.urn:mrn:imo:mmsi:230099999'
    delta.should.be.validSignalKDelta
  })

  it('writes nothing for the other 130850 variants', function () {
    const parser = new FromPgn({ useCamel: true })
    ;[
      // AP change course (ap48-tack.all), AP standby
      // (ac42-commissioning.raw), a race timer (simrad_event_timer_start.raw)
      // and an AP command (nac3-operations.raw).
      '2026-07-05T00:06:03.902Z,2,130850,21,255,12,41,9f,13,ff,ff,0a,1a,00,03,ae,00,ff',
      '2026-06-08T01:55:23.519,2,130850,21,255,12,41,9f,0d,ff,ff,0a,06,00,ff,ff,ff,ff',
      '2026-06-25T13:13:47.979Z,2,130850,30,255,12,41,9f,ff,ff,01,17,3d,00,ff,ff,ff,ff',
      '2026-06-08T02:27:11.886,2,130850,20,255,12,41,9f,ff,ff,64,0a,2b,00,ff,00,00,00'
    ].forEach(line => values(parser.parseString(line)).should.deep.equal([]))
  })
})
