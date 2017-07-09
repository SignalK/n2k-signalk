module.exports = [
  {
    value: function (n2k) {
      return n2k.fields.Date.replace(/\./g, '-') + 'T' + n2k.fields.Time + 'Z'
    },
    filter: function (n2k) {
      return (
        typeof n2k.fields['Date'] !== 'undefined' &&
        typeof n2k.fields['Time'] !== 'undefined'
      )
    },
    node: 'navigation.datetime'
  }
]
