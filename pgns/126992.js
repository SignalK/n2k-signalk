module.exports = [
  {
    value: function (n2k) {
      return n2k.fields.date.replace(/\./g, '-') + 'T' + n2k.fields.time + 'Z'
    },
    filter: function (n2k) {
      return (
        typeof n2k.fields.date !== 'undefined' &&
        typeof n2k.fields.time !== 'undefined'
      )
    },
    node: 'navigation.datetime'
  }
]
