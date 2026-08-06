var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('65226 J1939 active trouble codes', function () {
  it('all lamps off maps to a normal notification', function () {
    var tree = require('./testMapper').n2kToNested(
      JSON.parse(
        '{"timestamp":"2026-08-06T00:00:00.000Z","prio":6,"src":0,"dst":255,"pgn":65226,"description":"Active Trouble Codes","fields":{"malfunctionLampStatus":"00","redStopLampStatus":"00","amberWarningLampStatus":"00","protectLampStatus":"00"}}'
      )
    )
    tree.should.have.nested.property(
      'notifications.propulsion.0.troubleCodes.value.state',
      'normal'
    )
  })

  it('red stop lamp maps to an alarm with the DTC list in the message', function () {
    var tree = require('./testMapper').n2kToNested(
      JSON.parse(
        '{"timestamp":"2026-08-06T00:00:00.000Z","prio":6,"src":0,"dst":255,"pgn":65226,"description":"Active Trouble Codes","fields":{"malfunctionLampStatus":"00","redStopLampStatus":"40","amberWarningLampStatus":"00","protectLampStatus":"00","list":[{"spn":"00 03 60","fmi":"03","occurrenceCount":1}]}}'
      )
    )
    tree.should.have.nested.property(
      'notifications.propulsion.0.troubleCodes.value.state',
      'alarm'
    )
    var value = tree.notifications.propulsion['0'].troubleCodes.value
    value.message.should.contain('red stop lamp')
    value.message.should.contain('SPN 00 03 60 FMI 03')
    value.method.should.deep.equal(['visual', 'sound'])
  })
})
