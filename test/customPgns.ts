import { N2kMapper } from '../dist/n2kMapper'
import EventEmitter from 'events'
const signalkSchema = require('@signalk/signalk-schema')
import { PropertyValues } from '@signalk/server-api'

import chai from 'chai'
chai.should()
chai.use(require('chai-things'))
chai.use(require('@signalk/signalk-schema').chaiModule)

const mappings = {
  127999: [
    {
      node: function (n2k: any) {
        return 'tanks.fuel.' + n2k.fields['Instance'] + '.customCurrentLevel'
      },
      value: function (n2k: any) {
        const ratio100 = Number(n2k.fields['Level'])
        return ratio100 / 100
      }
    }
  ]
}

describe('custom pgns', function () {
  it('custom fulid pgn works', function () {
    const propertyValues = new PropertyValues()

    propertyValues.emitPropertyValue({
      timestamp: Date.now(),
      setter: 'customPgns',
      name: 'pgn-to-signalk',
      value: mappings
    })

    const n2kMapper = new N2kMapper({
      onPropertyValues: propertyValues.onPropertyValues.bind(propertyValues)
    })

    const delta = n2kMapper.toDelta(
      JSON.parse(
        '{"timestamp":"2015-01-15-16:15:30.984Z","prio":"6","src":"17","dst":"255","pgn":"127999","description":"Fluid Level","fields":{"Instance":"0","Type":"Fuel","Level":"131.068"}}'
      )
    )!
    delta.context = 'vessels.' + signalkSchema.fakeMmsiId
    const contextParts = delta.context.split('.')
    const tree = signalkSchema.deltaToFull(delta)[contextParts[0]][
      contextParts[1]
    ]

    tree.should.have.nested.property(
      'tanks.fuel.0.customCurrentLevel.value',
      1.31068
    )
  })
})
