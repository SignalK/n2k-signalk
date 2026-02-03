var chai = require('chai')
chai.Should()
const { expect } = chai
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('127507 charger status', function () {
  it('complete sentence converts', function () {
    const pgn =
      '{"canId":435295105,"prio":6,"src":129,"dst":255,"pgn":127507,"timestamp":"2021-07-30T16:48:59.722Z","input":[],"fields":{"Instance":113,"Battery Instance":0,"Operating State":"Disabled","Charge Mode":"Standalone mode","Charger Enabled":"Off"},"description":"Charger Status"}'

    const delta = require('./testMapper').toDelta(JSON.parse(pgn))

    findPathValue(
      delta,
      'electrical.charger.113.battery.0.operatingState'
    ).value.should.equal('disabled')
    findPathValue(
      delta,
      'electrical.charger.113.battery.0.chargeMode'
    ).value.should.equal('standalone mode')
    findPathValue(
      delta,
      'electrical.charger.113.battery.0.chargerEnabled'
    ).value.should.equal('off')
    expect(findPathValue(
      delta,
      'electrical.charger.113.battery.0.equalizationTimeRemaining'
    ).value).to.be.null
  })
})

function findPathValue(delta, path) {
  const found = delta.updates[0].values.find(
    (pathValue) => pathValue.path === path
  )
  if (!found) {
    throw new Error(
      `No pathValue with path ${path} in ${JSON.stringify(delta, null, 2)}`
    )
  }
  return found
}
