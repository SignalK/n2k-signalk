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

    messages(mapper.testToDelta(alert(1, 0, 'Normal'), alertState)).should.eql([
      'Bilge pump'
    ])
    // A later alert that reuses the ID waits for its own text
    messages(mapper.testToDelta(alert(1, 0, 'Active'), alertState)).should.eql(
      []
    )
  })

  it('stores nothing for an alert text without a description', function () {
    const alertState: any = {}
    mapper.testToDelta(alertText(1, 0, 'Bilge pump'), alertState)
    mapper.testToDelta(alertText(1, 0), alertState)

    expect(alertState['41'].alerts).to.deep.equal({})
    messages(mapper.testToDelta(alert(1, 0, 'Active'), alertState)).should.eql(
      []
    )
  })
})
