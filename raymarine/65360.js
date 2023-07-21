module.exports = [
  {
    node: 'steering.autopilot.target.headingTrue',
    filter: function (n2k) {
      return n2k.fields['Target Heading True']
    },
    source: 'Target Heading True'
  },
  {
    node: 'steering.autopilot.target.headingMagnetic',
    filter: function (n2k) {
      return n2k.fields['Target Heading Magnetic']
    },
    source: 'Target Heading Magnetic'
  }
]
