module.exports = [
  {
    value: function (n2k) {
      return {
        yaw: Number(n2k.fields.yaw),
        pitch: Number(n2k.fields.pitch),
        roll: Number(n2k.fields.roll)
      }
    },
    node: 'navigation.attitude'
  }
]
