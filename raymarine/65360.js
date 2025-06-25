module.exports = [
  {
    node: 'steering.autopilot.target.headingTrue',
    filter: function (n2k) {
      return n2k.fields.targetHeadingTrue
    },
    source: 'targetHeadingTrue'
  },
  {
    node: 'steering.autopilot.target.headingMagnetic',
    filter: function (n2k) {
      return n2k.fields.targetHeadingMagnetic
    },
    source: 'targetHeadingMagnetic'
  }
]
