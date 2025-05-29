// PGN 65359 Seatalk: Pilot Heading
module.exports = [
  {
    node: 'navigation.headingTrue',
    filter: function (n2k) {
      return (
        n2k.description === 'Seatalk: Pilot Heading' &&
        typeof n2k.fields.headingTrue !== 'undefined'
      )
    },
    source: 'headingTrue'
  },
  {
    node: 'navigation.headingMagnetic',
    filter: function (n2k) {
      return (
        n2k.description === 'Seatalk: Pilot Heading' &&
        typeof n2k.fields.headingMagnetic !== 'undefined'
      )
    },
    source: 'headingMagnetic'
  }
]
