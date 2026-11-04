import chai from 'chai'
chai.should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)
const expect = chai.expect

const mapper = require('./testMapper')

//provided by PGN 126985 Alert Text
const state = {
  '40': {
    alerts: {
      '20..23480': {
        languageId: 'English (US)',
        locationTextDescription: 'Engine Room',
        textDescription: 'TEST: Temperature over 0'
      }
    }
  }
}

const value = {
  state: 'warn',
  method: ['visual', 'sound'],
  message: 'TEST: Temperature over 0',
  location: 'Engine Room',
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
    const msg = JSON.parse(
      '{"canId":166725416,"prio":2,"src":40,"dst":255,"pgn":126983,"direction":"R","time":"15:48:36.090","fields":{"Alert Type":"Warning","Alert Category":"Navigational","Alert System":20,"Alert ID":23480,"Data Source Network ID NAME":6458553273545042000,"Data Source Instance":0,"Data Source Index-Source":0,"Alert Occurrence Number":1,"Temporary Silence Status":"Not Temporary Silence","Acknowledge Status":"Not Acknowledged","Escalation Status":"Not Escalated","Temporary Silence Support":"Yes","Acknowledge Support":"Yes","Escalation Support":"Not Supported","Acknowledge Source Network ID NAME":1233993542451364400,"Trigger Condition":"Auto","Threshold Status":"Threshold Exceeded","Alert Priority":187,"Alert State":"Active"},"description":"Alert","timestamp":"2020-03-03T15:48:36.494Z"}'
    )
    const tree = mapper.toNested(msg, state)
    tree.should.have.nested.property(
      'notifications.nmea.warning.navigational.20.23480.value'
    )

    expect(
      tree.notifications.nmea.warning.navigational[20][23480].value
    ).to.deep.include(value)

    const delta = mapper.testToDelta(msg)
    delta.updates.length.should.equal(1)
  })

  it('alert with temporary silence', function () {
    //method should be empty for this test
    value.method = []
    value.temporarySilenceStatus = 'Yes'

    const msg = JSON.parse(
      '{"canId":166725416,"prio":2,"src":40,"dst":255,"pgn":126983,"direction":"R","time":"15:48:36.090","fields":{"Alert Type":"Warning","Alert Category":"Navigational","Alert System":20,"Alert ID":23480,"Data Source Network ID NAME":6458553273545042000,"Data Source Instance":0,"Data Source Index-Source":0,"Alert Occurrence Number":1,"Temporary Silence Status":"Yes","Acknowledge Status":"Not Acknowledged","Escalation Status":"Not Escalated","Temporary Silence Support":"Yes","Acknowledge Support":"Yes","Escalation Support":"Not Supported","Acknowledge Source Network ID NAME":1233993542451364400,"Trigger Condition":"Auto","Threshold Status":"Threshold Exceeded","Alert Priority":187,"Alert State":"Active"},"description":"Alert","timestamp":"2020-03-03T15:48:36.494Z"}'
    )
    const tree = mapper.toNested(msg, state)
    tree.should.have.nested.property(
      'notifications.nmea.warning.navigational.20.23480.value'
    )

    expect(
      tree.notifications.nmea.warning.navigational[20][23480].value
    ).to.deep.include(value)

    const delta = mapper.testToDelta(msg)
    delta.updates.length.should.equal(1)
  })

  it('alert with acknowledgement', function () {
    value.temporarySilenceStatus = 'No'
    value.acknowledgeStatus = 'Yes'

    const msg = JSON.parse(
      '{"canId":166725416,"prio":2,"src":40,"dst":255,"pgn":126983,"direction":"R","time":"15:48:36.090","fields":{"Alert Type":"Warning","Alert Category":"Navigational","Alert System":20,"Alert ID":23480,"Data Source Network ID NAME":6458553273545042000,"Data Source Instance":0,"Data Source Index-Source":0,"Alert Occurrence Number":1,"Temporary Silence Status":"No","Acknowledge Status":"Yes","Escalation Status":"Not Escalated","Temporary Silence Support":"Yes","Acknowledge Support":"Yes","Escalation Support":"Not Supported","Acknowledge Source Network ID NAME":1233993542451364400,"Trigger Condition":"Auto","Threshold Status":"Threshold Exceeded","Alert Priority":187,"Alert State":"Active"},"description":"Alert","timestamp":"2020-03-03T15:48:36.494Z"}'
    )
    const tree = mapper.toNested(msg, state)
    tree.should.have.nested.property(
      'notifications.nmea.warning.navigational.20.23480.value'
    )

    expect(
      tree.notifications.nmea.warning.navigational[20][23480].value
    ).to.deep.include(value)

    const delta = mapper.testToDelta(msg)
    delta.updates.length.should.equal(1)
  })

  it("maps non-standard alertType to 'alert' state without throwing", function () {
    const alertId = 9999
    const nonStandardState = {
      '128': {
        alerts: {
          [`4..${alertId}`]: {
            languageId: 'English (US)',
            locationTextDescription: '',
            textDescription: 'TEST: non-standard alertType'
          }
        }
      }
    }
    const msg = {
      canId: 166725504,
      prio: 2,
      src: 128,
      pgn: 126983,
      dst: 255,
      fields: {
        alertType: 4,
        alertCategory: 6,
        alertSystem: 4,
        alertId: alertId
      },
      description: 'Alert',
      id: 'alert',
      timestamp: '2024-01-01T00:00:00.000Z'
    }
    // The harness does a canboatjs round-trip via pgnToActisenseSerialFormat,
    // which would normalize away the broken value, so we bypass it.
    const saved = process.env.NO_CANBOATJS
    process.env.NO_CANBOATJS = 'true'
    try {
      const delta = mapper.toDelta(msg, nonStandardState)
      delta.updates[0].values.length.should.equal(1)
      const v = delta.updates[0].values[0]
      v.value.state.should.equal('alert')
      // Raw alertType from the device is preserved verbatim in the value
      // object, consistent with how every other field is exposed.
      v.value.alertType.should.equal(4)
      // Non-string alertCategory degrades to an empty path segment rather
      // than crashing on .toLowerCase().
      v.path.should.contain('.caution..')
      v.path.should.equal('notifications.nmea.caution..4.' + alertId)
    } finally {
      if (saved === undefined) delete process.env.NO_CANBOATJS
      else process.env.NO_CANBOATJS = saved
    }
  })

  it('defaults location to empty string when no location text is present', function () {
    const noLocationState = {
      '40': {
        alerts: {
          '20..23480': {
            languageId: 'English (US)',
            locationTextDescription: '',
            textDescription: 'TEST: Temperature over 0'
          }
        }
      }
    }

    const msg = JSON.parse(
      '{"canId":166725416,"prio":2,"src":40,"dst":255,"pgn":126983,"direction":"R","time":"15:48:36.090","fields":{"Alert Type":"Warning","Alert Category":"Navigational","Alert System":20,"Alert ID":23480,"Data Source Network ID NAME":6458553273545042000,"Data Source Instance":0,"Data Source Index-Source":0,"Alert Occurrence Number":1,"Temporary Silence Status":"Not Temporary Silence","Acknowledge Status":"Not Acknowledged","Escalation Status":"Not Escalated","Temporary Silence Support":"Yes","Acknowledge Support":"Yes","Escalation Support":"Not Supported","Acknowledge Source Network ID NAME":1233993542451364400,"Trigger Condition":"Auto","Threshold Status":"Threshold Exceeded","Alert Priority":187,"Alert State":"Active"},"description":"Alert","timestamp":"2020-03-03T15:48:36.494Z"}'
    )
    const tree = mapper.toNested(msg, noLocationState)

    tree.notifications.nmea.warning.navigational[20][23480].value.location.should.equal(
      ''
    )
  })
})
