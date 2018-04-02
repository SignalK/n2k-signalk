module.exports = [
  {
    source: 'Wind Speed',
    node: 'environment.wind.speedApparent',
    filter: function (n2k) {
      return n2k.fields['Reference'] === 'Apparent'
    }
  },
  {
    source: 'Wind Speed',
    node: 'environment.wind.speedTrue',
    filter: function (n2k) {
      return n2k.fields['Reference'] === 'True (boat referenced)'
    }
  },
  {
    source: 'Wind Speed',
    node: 'environment.wind.speedOverGround',
    filter: function (n2k) {
      return n2k.fields['Reference'] === 'True (ground referenced to North)'
    }
  },
  {
    node: 'environment.wind.angleApparent',
    filter: function (n2k) {
      return n2k.fields['Reference'] === 'Apparent'
    },
    value: function (n2k) {
      var angle = Number(n2k.fields['Wind Angle'])
      return angle <= Math.PI ? angle : angle - Math.PI * 2
    }
  },
  {
    source: 'Wind Angle',
    node: 'environment.wind.angleTrueWater',
    filter: function (n2k) {
      return n2k.fields['Reference'] === 'True (boat referenced)'
    }
  },
  {
    source: 'Wind Angle',
    node: 'environment.wind.directionTrue',
    filter: function (n2k) {
      return n2k.fields['Reference'] === 'True (ground referenced to North)'
    }
  },
  {
    source: 'Wind Angle',
    node: 'environment.wind.directionMagnetic',
    filter: function (n2k) {
      return n2k.fields['Reference'] === 'Magnetic (ground referenced to Magnetic North)'
    }
  }
]
