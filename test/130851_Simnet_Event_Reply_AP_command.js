const chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

const testMapper = require('./testMapper')

describe('130851 Simnet: Event Reply: AP command",', () => {
  it('Decodes auto mode', () => {
    const input = {
      timestamp: '2022-04-12T15:08:50.915Z',
      prio: 7,
      src: 0,
      dst: 255,
      pgn: 130851,
      description: 'Simnet: Event Reply: AP command',
      fields: {
        'Manufacturer Code': 'Simrad',
        'Industry Code': 'Marine Industry',
        'Proprietary ID': '0',
        'Controlling Device': 10,
        Event: 'Auto mode',
      },
    }
    const delta = testMapper.toDelta(input)
    delta.updates[0].values.length.should.equal(1)
    delta.updates[0].values
      .find((pathValue) => pathValue.path === 'steering.autopilot.state')
      .value.should.equal('auto')
  })

  it('Decodes standby mode', () => {
    const input = {
      timestamp: '2022-04-12T15:09:13.049Z',
      prio: 7,
      src: 0,
      dst: 255,
      pgn: 130851,
      description: 'Simnet: Event Reply: AP command',
      fields: {
        'Manufacturer Code': 'Simrad',
        'Industry Code': 'Marine Industry',
        'Proprietary ID': '0',
        'Controlling Device': 10,
        Event: 'Standby',
      },
    }
    const delta = testMapper.toDelta(input)
    delta.updates[0].values.length.should.equal(1)
    delta.updates[0].values
      .find((pathValue) => pathValue.path === 'steering.autopilot.state')
      .value.should.equal('standby')
  })
})


/*
            "Order":7,
            "Id":"event",
            "Name":"Event",
            "BitLength":16,
            "BitOffset":48,
            "BitStart":0,
            "Type":"Lookup table",
            "Signed":false,
            "EnumValues":[
              {"name":"Standby","value":"6"},
              {"name":"Auto mode","value":"9"},
              {"name":"Nav mode","value":"10"},
              {"name":"Non Follow Up mode","value":"13"},
              {"name":"Wind mode","value":"15"},
              {"name":"Square (Turn)","value":"18"},
              {"name":"C-Turn","value":"19"},
              {"name":"U-Turn","value":"20"},
              {"name":"Spiral (Turn)","value":"21"},
              {"name":"Zig Zag (Turn)","value":"22"},
              {"name":"Lazy-S (Turn)","value":"23"},
              {"name":"Depth (Turn)","value":"24"},
              {"name":"Change Course","value":"26"}]},
*/
