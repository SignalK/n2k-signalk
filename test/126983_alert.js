var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)
var expect = chai.expect

var mapper = require('./testMapper')

//provided by PGN 126985 Alert Text
var state = {
  '40': {
    alerts: {
      '23480': {
        languageId: 'English (US)',
        locationTextDescription: '',
        textDescription: 'TEST: Temperature over 0'
      }
    }
  }
}

var value = {
  state: 'warn',
  method: ['visual', 'sound'],
  message: 'TEST: Temperature over 0',
  alertType: 'Warning',
  alertCategory: 'Navigational',
  alertSystem: 20,
  alertId: 23480,
  dataSourceNetworkIDNAME: 6458553273545042000,
  dataSourceInstance: 0,
  'dataSourceIndex-Source': 0,
  occurrence: 1,
  temporarySilenceStatus: 'No',
  acknowledgeStatus: 'No',
  escalationStatus: 'No',
  temporarySilenceSupport: 'Yes',
  acknowledgeSupport: 'Yes',
  escalationSupport: 'No',
  acknowledgeSourceNetworkIDNAME: 1233993542451364400,
  triggerCondition: 'Auto',
  thresholdStatus: 'Threshold Exceeded',
  alertPriority: 187,
  alertState: 'Active'
}

describe('126983 Alert', function () {
  it('alert without silence or ackknowledgement', function () {
    var msg = JSON.parse(
      '{"canId":166725416,"prio":2,"src":40,"dst":255,"pgn":126983,"direction":"R","time":"15:48:36.090","fields":{"Alert Type":"Warning","Alert Category":"Navigational","Alert System":20,"Alert ID":23480,"Data Source Network ID NAME":6458553273545042000,"Data Source Instance":0,"Data Source Index-Source":0,"Alert Occurrence Number":1,"Temporary Silence Status":"Not Temporary Silence","Acknowledge Status":"Not Acknowledged","Escalation Status":"Not Escalated","Temporary Silence Support":"Yes","Acknowledge Support":"Yes","Escalation Support":"Not Supported","Acknowledge Source Network ID NAME":1233993542451364400,"Trigger Condition":"Auto","Threshold Status":"Threshold Exceeded","Alert Priority":187,"Alert State":"Active"},"description":"Alert","timestamp":"2020-03-03T15:48:36.494Z"}'
    )
    var tree = mapper.toNested(msg, state)
    tree.should.have.nested.property(
      'notifications.nmea.warning.navigational.20.23480.value'
    )

    expect(
      tree.notifications.nmea.warning.navigational[20][23480].value
    ).to.deep.include(value)

    var delta = mapper.testToDelta(msg)
    delta.updates.length.should.equal(1)
  })

  it('alert with temporary silence', function () {
    //method should be empty for this test
    value.method = []
    value.temporarySilenceStatus = 'Yes'

    var msg = JSON.parse(
      '{"canId":166725416,"prio":2,"src":40,"dst":255,"pgn":126983,"direction":"R","time":"15:48:36.090","fields":{"Alert Type":"Warning","Alert Category":"Navigational","Alert System":20,"Alert ID":23480,"Data Source Network ID NAME":6458553273545042000,"Data Source Instance":0,"Data Source Index-Source":0,"Alert Occurrence Number":1,"Temporary Silence Status":"Yes","Acknowledge Status":"Not Acknowledged","Escalation Status":"Not Escalated","Temporary Silence Support":"Yes","Acknowledge Support":"Yes","Escalation Support":"Not Supported","Acknowledge Source Network ID NAME":1233993542451364400,"Trigger Condition":"Auto","Threshold Status":"Threshold Exceeded","Alert Priority":187,"Alert State":"Active"},"description":"Alert","timestamp":"2020-03-03T15:48:36.494Z"}'
    )
    var tree = mapper.toNested(msg, state)
    tree.should.have.nested.property(
      'notifications.nmea.warning.navigational.20.23480.value'
    )

    expect(
      tree.notifications.nmea.warning.navigational[20][23480].value
    ).to.deep.include(value)

    var delta = mapper.testToDelta(msg)
    delta.updates.length.should.equal(1)
  })

  it('alert with acknowledgement', function () {
    value.temporarySilenceStatus = 'No'
    value.acknowledgeStatus = 'Yes'

    var msg = JSON.parse(
      '{"canId":166725416,"prio":2,"src":40,"dst":255,"pgn":126983,"direction":"R","time":"15:48:36.090","fields":{"Alert Type":"Warning","Alert Category":"Navigational","Alert System":20,"Alert ID":23480,"Data Source Network ID NAME":6458553273545042000,"Data Source Instance":0,"Data Source Index-Source":0,"Alert Occurrence Number":1,"Temporary Silence Status":"No","Acknowledge Status":"Yes","Escalation Status":"Not Escalated","Temporary Silence Support":"Yes","Acknowledge Support":"Yes","Escalation Support":"Not Supported","Acknowledge Source Network ID NAME":1233993542451364400,"Trigger Condition":"Auto","Threshold Status":"Threshold Exceeded","Alert Priority":187,"Alert State":"Active"},"description":"Alert","timestamp":"2020-03-03T15:48:36.494Z"}'
    )
    var tree = mapper.toNested(msg, state)
    tree.should.have.nested.property(
      'notifications.nmea.warning.navigational.20.23480.value'
    )

    expect(
      tree.notifications.nmea.warning.navigational[20][23480].value
    ).to.deep.include(value)

    var delta = mapper.testToDelta(msg)
    delta.updates.length.should.equal(1)
  })

  it('skips alerts with non-standard (integer) alertType without throwing', function () {
    // Some devices emit alertType values outside the canboat ALERT_TYPE
    // enum (1,2,5,8). canboatjs returns the raw integer in that case;
    // previously the mapper crashed in node() and value() trying to call
    // .replace on a number. The filter should drop these frames cleanly.
    var msg = {
      canId: 166725504,
      prio: 2,
      src: 128,
      pgn: 126983,
      dst: 255,
      fields: {
        alertType: 4,
        alertCategory: 6,
        alertSystem: 4
      },
      description: 'Alert',
      id: 'alert',
      timestamp: '2024-01-01T00:00:00.000Z'
    }
    // The harness does a canboatjs round-trip via pgnToActisenseSerialFormat,
    // which would normalize away the broken value, so we bypass it.
    var saved = process.env.NO_CANBOATJS
    process.env.NO_CANBOATJS = 'true'
    try {
      var delta = mapper.toDelta(msg, {})
      // No throw, and the mapper should emit zero values for an unknown
      // alertType (the empty update wrapper itself is still constructed).
      delta.updates[0].values.length.should.equal(0)
    } finally {
      if (saved === undefined) delete process.env.NO_CANBOATJS
      else process.env.NO_CANBOATJS = saved
    }
  })
})
