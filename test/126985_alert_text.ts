import chai from 'chai'
chai.should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)
const expect = chai.expect

const mapper = require('./testMapper')

const state = {}

describe('126985 alert text', function () {
  it('alert text converts', function () {
    mapper.toNested(
      JSON.parse(
        '{"canId":166725928,"prio":2,"src":40,"dst":255,"pgn":126985,"direction":"R","time":"15:52:04.346","fields":{"Alert Type":"Warning","Alert Category":"Navigational","Alert System":20,"Alert ID":23480,"Data Source Network ID NAME":6458553273545042000,"Data Source Instance":0,"Data Source Index-Source":0,"Alert Occurrence Number":1,"Language ID":"English (US)","Alert Text Description":"TEST: Temperature over 0"},"description":"Alert Text","timestamp":"2020-03-03T15:52:04.505Z"}'
      ),
      state
    )

    const text = {
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
    expect(state).to.deep.include(text)
  })

  // A source can run several alert systems and sub-systems, each with its
  // own alert IDs (#391)
  function alertText(system: number, subSystem: number, text?: string) {
    return {
      prio: 2,
      src: 41,
      dst: 255,
      pgn: 126985,
      fields: {
        'Alert Type': 'Warning',
        'Alert Category': 'Technical',
        'Alert System': system,
        'Alert Sub-System': subSystem,
        'Alert ID': 7,
        'Data Source Instance': 0,
        'Alert Occurrence Number': 1,
        'Language ID': 'English (US)',
        ...(text === undefined ? {} : { 'Alert Text Description': text })
      }
    }
  }

  function alert(system: number, subSystem: number, alertState: string) {
    return {
      prio: 2,
      src: 41,
      dst: 255,
      pgn: 126983,
      fields: {
        'Alert Type': 'Warning',
        'Alert Category': 'Technical',
        'Alert System': system,
        'Alert Sub-System': subSystem,
        'Alert ID': 7,
        'Data Source Instance': 0,
        'Alert Occurrence Number': 1,
        'Alert State': alertState
      }
    }
  }

  function messages(delta: any): unknown[] {
    return (delta?.updates ?? []).flatMap((u: any) =>
      u.values.map((v: any) => v.value.message)
    )
  }

  function states(delta: any): unknown[] {
    return (delta?.updates ?? []).flatMap((u: any) =>
      u.values.map((v: any) => v.value.state)
    )
  }

  it('keeps the texts of alerts with the same ID apart', function () {
    const alertState = {}
    mapper.testToDelta(alertText(1, 0, 'Bilge pump'), alertState)
    mapper.testToDelta(alertText(1, 2, 'Fridge'), alertState)
    mapper.testToDelta(alertText(3, 0, 'Shore power'), alertState)

    messages(mapper.testToDelta(alert(1, 0, 'Active'), alertState)).should.eql([
      'Bilge pump'
    ])
    messages(mapper.testToDelta(alert(1, 2, 'Active'), alertState)).should.eql([
      'Fridge'
    ])
    messages(mapper.testToDelta(alert(3, 0, 'Active'), alertState)).should.eql([
      'Shore power'
    ])
  })

  it('forgets an alert text once the alert is back to normal', function () {
    const alertState = {}
    mapper.testToDelta(alertText(1, 0, 'Bilge pump'), alertState)

    const normal = mapper.testToDelta(alert(1, 0, 'Normal'), alertState)
    messages(normal).should.eql(['Bilge pump'])
    states(normal).should.eql(['normal'])
    // A later alert that reuses the ID waits for its own text
    messages(mapper.testToDelta(alert(1, 0, 'Active'), alertState)).should.eql(
      []
    )
  })

  it('stores nothing for an alert text without a description', function () {
    const alertState: any = {}
    mapper.testToDelta(alertText(1, 0), alertState)
    expect(alertState['41']?.alerts ?? {}).to.deep.equal({})
    messages(mapper.testToDelta(alert(1, 0, 'Active'), alertState)).should.eql(
      []
    )
  })

  it('keeps an alert text when a later one has no or an empty description', function () {
    // So that the alert can still go back to normal
    const alertState = {}
    mapper.testToDelta(alertText(1, 0, 'Bilge pump'), alertState)
    mapper.testToDelta(alertText(1, 0), alertState)
    mapper.testToDelta(alertText(1, 0, ''), alertState)
    const normal = mapper.testToDelta(alert(1, 0, 'Normal'), alertState)
    messages(normal).should.eql(['Bilge pump'])
    states(normal).should.eql(['normal'])
  })

  function alertOfType(alertType: string, subSystem: number, state: string) {
    const frame = alert(1, subSystem, state)
    frame.fields['Alert Type'] = alertType
    return frame
  }

  function paths(delta: any): unknown[] {
    return (delta?.updates ?? []).flatMap((u: any) =>
      u.values.map((v: any) => v.path)
    )
  }

  it('keeps an alert on one path when it escalates, so normal clears it (#414)', function () {
    const alertState = {}
    mapper.testToDelta(alertText(1, 2, 'Bilge pump'), alertState)
    const expected = ['notifications.nmea.technical.1.2.7']

    const warning = mapper.testToDelta(
      alertOfType('Warning', 2, 'Active'),
      alertState
    )
    paths(warning).should.eql(expected)
    states(warning).should.eql(['warn'])

    const alarm = mapper.testToDelta(
      alertOfType('Alarm', 2, 'Active'),
      alertState
    )
    paths(alarm).should.eql(expected)
    states(alarm).should.eql(['alarm'])

    const normal = mapper.testToDelta(
      alertOfType('Alarm', 2, 'Normal'),
      alertState
    )
    paths(normal).should.eql(expected)
    states(normal).should.eql(['normal'])
  })

  it('gives alerts that differ only in sub-system their own paths (#414)', function () {
    const alertState = {}
    mapper.testToDelta(alertText(1, 0, 'Bilge pump'), alertState)
    mapper.testToDelta(alertText(1, 2, 'Fridge'), alertState)

    const first = mapper.testToDelta(alert(1, 0, 'Active'), alertState)
    const second = mapper.testToDelta(alert(1, 2, 'Active'), alertState)
    paths(first).should.eql(['notifications.nmea.technical.1.0.7'])
    paths(second).should.eql(['notifications.nmea.technical.1.2.7'])
    first.updates[0].values[0].value.alertSubSystem.should.equal(0)
    second.updates[0].values[0].value.alertSubSystem.should.equal(2)
  })

  it('writes an active alert with the state of its type', function () {
    const alertState = {}
    mapper.testToDelta(alertText(1, 0, 'Bilge pump'), alertState)
    states(mapper.testToDelta(alert(1, 0, 'Active'), alertState)).should.eql([
      'warn'
    ])
  })
})
