module.exports = [
  {
    value: function (n2k) {
      return {
        longitude: Number(n2k.fields.longitude),
        latitude: Number(n2k.fields.latitude)
      }
    },
    filter: function (n2k) {
      return (
        typeof n2k.fields.longitude !== 'undefined' &&
        typeof n2k.fields.latitude !== 'undefined'
      )
    },
    node: 'navigation.position'
  }
]
