module.exports = [
  {
    source: 'heading',
    node: 'navigation.headingMagnetic',
    filter: function (n2k) {
      return (
        n2k.fields.reference === 'Magnetic' &&
        typeof n2k.fields.heading !== 'undefined'
      )
    }
  },
  {
    source: 'heading',
    node: 'navigation.headingTrue',
    filter: function (n2k) {
      return (
        n2k.fields.reference === 'True' &&
        typeof n2k.fields.heading !== 'undefined'
      )
    }
  },
  {
    source: 'variation',
    node: 'navigation.magneticVariation',
    filter: function (n2k) {
      return typeof n2k.fields.variation !== 'undefined'
    }
  },
  {
    source: 'deviation',
    node: 'navigation.magneticDeviation',
    filter: function (n2k) {
      return typeof n2k.fields.deviation !== 'undefined'
    }
  }
]
