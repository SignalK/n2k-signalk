module.exports = [
  {
    node: 'propulsion.port.revolutions',
    filter: function (n2k) {
      return (
        n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port'
      )
    },
    value: function (n2k) {
      var rpm = Number(n2k.fields['Engine Speed'])
      return rpm / 60.0
    }
  },
  {
    node: 'propulsion.starboard.revolutions',
    filter: function (n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard'
    },
    value: function (n2k) {
      var rpm = Number(n2k.fields['Engine Speed'])
      return rpm / 60.0
    }
  }
]
