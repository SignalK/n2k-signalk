module.exports = [
  {
    node: 'steering.autopilot.target.windAngleApparent',
    value: function (n2k) {
      var angle = Number(n2k.fields['Wind Datum'])
      if (angle > Math.PI) angle = angle - Math.PI * 2
      return angle
    }
  }
]
