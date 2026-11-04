import { PGN_130306 } from '@canboat/ts-pgns'

module.exports = [
  {
    source: 'windSpeed',
    node: 'environment.wind.speedApparent',
    filter: function (n2k: PGN_130306) {
      return (
        (n2k.fields.reference as unknown) === 'Apparent' ||
        (n2k.fields.reference as unknown) === undefined ||
        (n2k.fields.reference as unknown) === null
      )
    }
  },
  {
    source: 'windSpeed',
    node: 'environment.wind.speedTrue',
    filter: function (n2k: PGN_130306) {
      return (n2k.fields.reference as unknown) === 'True (boat referenced)'
    }
  },
  {
    source: 'windSpeed',
    node: 'environment.wind.speedOverGround',
    filter: function (n2k: PGN_130306) {
      return (
        (n2k.fields.reference as unknown) ===
        'True (ground referenced to North)'
      )
    }
  },
  {
    node: 'environment.wind.angleApparent',
    filter: function (n2k: PGN_130306) {
      return (
        (n2k.fields.reference as unknown) === 'Apparent' ||
        (n2k.fields.reference as unknown) === undefined ||
        (n2k.fields.reference as unknown) === null
      )
    },
    value: function (n2k: PGN_130306) {
      const angle = Number(n2k.fields.windAngle)
      return angle <= Math.PI ? angle : angle - Math.PI * 2
    }
  },
  {
    node: 'environment.wind.angleTrueWater',
    filter: function (n2k: PGN_130306) {
      return (n2k.fields.reference as unknown) === 'True (boat referenced)'
    },
    value: function (n2k: PGN_130306) {
      const angle = Number(n2k.fields.windAngle)
      return angle <= Math.PI ? angle : angle - Math.PI * 2
    }
  },
  {
    source: 'windAngle',
    node: 'environment.wind.directionTrue',
    filter: function (n2k: PGN_130306) {
      return (
        (n2k.fields.reference as unknown) ===
        'True (ground referenced to North)'
      )
    }
  },
  {
    source: 'windAngle',
    node: 'environment.wind.directionMagnetic',
    filter: function (n2k: PGN_130306) {
      return (
        (n2k.fields.reference as unknown) ===
        'Magnetic (ground referenced to Magnetic North)'
      )
    }
  }
]
