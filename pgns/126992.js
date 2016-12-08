
module.exports = [
  {
    value: function(n2k) {
      return n2k.fields.Date.replace(/\./g, '-') + "T" + n2k.fields.Time + "Z";
    },
    node: 'navigation.datetime'
  }
]
