module.exports = [
  {
    value: function (n2k) {
      return {
        longitude: Number(n2k.fields.Longitude),
        latitude: Number(n2k.fields.Latitude)
      }
    },
    filter: function (n2k) {
      return (
        typeof n2k.fields['Longitude'] !== 'undefined' &&
        typeof n2k.fields['Latitude'] !== 'undefined'
      )
    },
    node: 'navigation.position'
  }
]
