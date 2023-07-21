// PGN 65359 Seatalk: Pilot Heading
module.exports = [
  {
    node: 'navigation.headingTrue',
    filter: function (n2k) {
      return (
        n2k.description === 'Seatalk: Pilot Heading' &&
        typeof n2k.fields['Heading True'] !== 'undefined'
      )
    },
    source: 'Heading True'
  },
  {
    node: 'navigation.headingMagnetic',
    filter: function (n2k) {
      return (
        n2k.description === 'Seatalk: Pilot Heading' &&
        typeof n2k.fields['Heading Magnetic'] !== 'undefined'
      )
    },
    source: 'Heading Magnetic'
  }
]
