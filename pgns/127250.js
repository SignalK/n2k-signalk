module.exports = [
  {
    source: 'Heading',
    node: 'navigation.headingMagnetic',
    filter: function (n2k) {
      return (
        n2k.fields['Reference'] === 'Magnetic' &&
        typeof n2k.fields['Heading'] !== 'undefined'
      )
    }
  },
  {
    source: 'Heading',
    node: 'navigation.headingTrue',
    filter: function (n2k) {
      return (
        n2k.fields['Reference'] === 'True' &&
        typeof n2k.fields['Heading'] !== 'undefined'
      )
    }
  },
  {
    source: 'Variation',
    node: 'navigation.magneticVariation',
    filter: function (n2k) {
      return typeof n2k.fields['Variation'] !== 'undefined'
    }
  }
]
