var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)
var expect = chai.expect

const mapper = require('./testMapper')

var state = {}

describe('126985 alert text', function () {
  it('alert text converts', function () {
    mapper.toNested(
      JSON.parse(
        '{"canId":166725928,"prio":2,"src":40,"dst":255,"pgn":126985,"direction":"R","time":"15:52:04.346","fields":{"Alert Type":"Warning","Alert Category":"Navigational","Alert System":20,"Alert ID":23480,"Data Source Network ID NAME":6458553273545042000,"Data Source Instance":0,"Data Source Index-Source":0,"Alert Occurrence Number":1,"Language ID":"English (US)","Alert Text Description":"TEST: Temperature over 0"},"description":"Alert Text","timestamp":"2020-03-03T15:52:04.505Z"}'
      ),
      state
    )

    var text = {
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
    expect(state).to.deep.include(text)
  })
})
