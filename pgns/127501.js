module.exports = [
  function (n2k) {
    var res = []
    for (var i = 1; i <= 28; i++) {
      const field = 'Indicator' + i
      if (typeof n2k.fields[field] !== 'undefined') {
        const basePath =
          'electrical.switches.' + n2k.fields['Instance'] + '.' + i

        res.push({
          path: basePath + '.state',
          value: n2k.fields[field] == 'On' ? 1 : 0
        })

        res.push({
          path: basePath + '.order',
          value: i
        })
      }
    }
    return res
  }
]
