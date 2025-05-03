module.exports = [
  {
    source: 'position',
    node: 'steering.rudderAngle',
    filter: function (n2k) {
      return typeof n2k.fields.position !== 'undefined'
    }
  }
]
