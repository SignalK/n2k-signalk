const N2kMapper = require('../n2kMapper').N2kMapper
const EventEmitter = require('events')
const signalkSchema = require('@signalk/signalk-schema')

var chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

const mappings = [
  {
    node: function (n2k) {
      return (
        'tanks.fuel.' +
          n2k.fields['Instance'] +
          '.customCurrentLevel'
      )
    },
    value: function (n2k) {
      var ratio100 = Number(n2k.fields['Level'])
      return ratio100 / 100
    }
  }
]

describe('custom pgns', function () {
  it('custom fulid pgn works', function () {
    const emitter = new EventEmitter();

    emitter.on('pgn-to-signalk-available', () => {
      emitter.emit('pgn-to-signalk', 127999, mappings)
    })

    const n2kMapper = new N2kMapper({}, emitter)
   
    var delta = n2kMapper.toDelta(JSON.parse(
      '{"timestamp":"2015-01-15-16:15:30.984Z","prio":"6","src":"17","dst":"255","pgn":"127999","description":"Fluid Level","fields":{"Instance":"0","Type":"Fuel","Level":"131.068"}}'
    ))
    delta.context = 'vessels.' + signalkSchema.fakeMmsiId
    var contextParts = delta.context.split('.')
    var tree = signalkSchema.deltaToFull(delta)[contextParts[0]][contextParts[1]]

    tree.should.have.nested.property('tanks.fuel.0.customCurrentLevel.value', 1.31068)
    tree.should.be.validSignalKVesselIgnoringIdentity
  })
})
