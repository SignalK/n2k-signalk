import { PGN_127250 } from '@canboat/ts-pgns'

module.exports = [
  {
    source: 'heading',
    node: 'navigation.headingMagnetic',
    filter: function (n2k: PGN_127250) {
      return (
        n2k.fields.reference === 'Magnetic' &&
        typeof n2k.fields.heading !== 'undefined'
      )
    }
  },
  {
    source: 'heading',
    node: 'navigation.headingTrue',
    filter: function (n2k: PGN_127250) {
      return (
        n2k.fields.reference === 'True' &&
        typeof n2k.fields.heading !== 'undefined'
      )
    }
  },
  {
    source: 'variation',
    node: 'navigation.magneticVariation',
    filter: function (n2k: PGN_127250) {
      return typeof n2k.fields.variation !== 'undefined'
    }
  },
  {
    source: 'deviation',
    node: 'navigation.magneticDeviation',
    filter: function (n2k: PGN_127250) {
      return typeof n2k.fields.deviation !== 'undefined'
    }
  }
]
