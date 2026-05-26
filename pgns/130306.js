module.exports = [
  {
    source: 'windSpeed',
    node: 'environment.wind.speedApparent',
    filter: function (n2k) {
      return (
        n2k.fields.reference === 'Apparent' ||
        n2k.fields.reference === undefined ||
        n2k.fields.reference === null
      )
    }
  },
  {
    source: 'windSpeed',
    node: 'environment.wind.speedTrue',
    filter: function (n2k) {
      return n2k.fields.reference === 'True (boat referenced)'
    }
  },
  {
    source: 'windSpeed',
    node: 'environment.wind.speedOverGround',
    filter: function (n2k) {
      return n2k.fields.reference === 'True (ground referenced to North)'
    }
  },
  {
    node: 'environment.wind.angleApparent',
    filter: function (n2k) {
      return (
        n2k.fields.reference === 'Apparent' ||
        n2k.fields.reference === undefined ||
        n2k.fields.reference === null
      )
    },
    value: function (n2k) {
      var angle = Number(n2k.fields.windAngle)
      return angle <= Math.PI ? angle : angle - Math.PI * 2
    }
  },
  {
    source: 'windAngle',
    node: 'environment.wind.angleTrueWater',
    filter: function (n2k) {
      return n2k.fields.reference === 'True (boat referenced)'
    }
  },
  {
    source: 'windAngle',
    node: 'environment.wind.directionTrue',
    filter: function (n2k) {
      return n2k.fields.reference === 'True (ground referenced to North)'
    }
  },
  {
    source: 'windAngle',
    node: 'environment.wind.directionMagnetic',
    filter: function (n2k) {
      return (
        n2k.fields.reference ===
        'Magnetic (ground referenced to Magnetic North)'
      )
    }
  }
]
