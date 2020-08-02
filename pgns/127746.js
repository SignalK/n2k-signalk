
function prefix(n2k) {
  return `electrical.ac.${n2k.src}.${n2k.fields['Connection Number']}.l3`
}

module.exports = [
  {
    node: n2k => prefix(n2k) + '.power',
    value: n2k => n2k.fields['Power'],
    filter: n2k => typeof n2k.fields['Power'] !== 'undefined'
  },
  {
    node: n2k => prefix(n2k) + '.current',
    value: n2k => n2k.fields['AC RMS Current'],
    filter: n2k => typeof n2k.fields['AC RMS Current'] !== 'string'
  }
]
