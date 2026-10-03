var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))

describe('127497 Trip Parameters, Engine', function () {
  it('complete engine boost sentence converts', function () {
    var tree = require('./testMapper').toNested(
      JSON.parse(
        '{"prio":5,"pgn":127497,"dst":255,"src":56,"timestamp":"2017-10-06T07:52:53.225Z","fields":{"Instance":"Dual Engine Starboard","Trip Fuel Used":4.271, "Fuel Rate, Average": 0.0000277778,"Fuel Rate, Economy": 0.000025,"Instantaneous Fuel Economy":0.0000583333},"description":"Trip Parameters, Engine"}'
      )
    )
    tree.should.have.nested.property(
      'propulsion.starboard.trip.fuelUsed.value',
      4.271
    )
    tree.should.have.nested.property(
      'propulsion.starboard.trip.fuelRate.average.value',
      0.0000277778
    )
    tree.should.have.nested.property(
      'propulsion.starboard.trip.fuelRate.economy.value',
      0.000025
    )
    tree.should.have.nested.property(
      'propulsion.starboard.trip.fuelRate.instantaneousEconomy.value',
      0.0000583333
    )
  })
})
