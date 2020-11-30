module.exports = [
  function (n2k) {
    var res = []
    for (var i = 0; i < 28; i++) {
      const field = 'Indicator' + i
      if (typeof n2k.fields[field] !== 'undefined') {
        const basePath =
          'electrical.switches.bank.' + n2k.fields['Instance'] + '.' + i

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

module.exports.meta = (n2k) => {
  var res = []
  for (var i = 0; i < 28; i++) {
    const field = 'Indicator' + i
    if (typeof n2k.fields[field] !== 'undefined') {
      const basePath =
            `electrical.switches.bank.${n2k.fields['Instance']}.${i}.state`
      
      res.push({
        path: basePath,
        value: {
          bankNumber: n2k.fields['Instance'],
          switchNumber: i
        }
      })
    }
  }
  return res
}
