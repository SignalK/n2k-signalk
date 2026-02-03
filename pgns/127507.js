
function prefix(n2k) {
  return `electrical.charger.${n2k.fields['Instance']}.battery.${n2k.fields['Battery Instance']}`
}

module.exports = [
  {
    node: n2k => prefix(n2k) + '.operatingState',
    value: n2k => n2k.fields['Operating State'].toLowerCase(),
    filter: n2k => typeof n2k.fields['Operating State'] === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.chargeMode',
    value: n2k => n2k.fields['Charge Mode'].toLowerCase(),
    filter: n2k => typeof n2k.fields['Charge Mode'] === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.chargerEnabled',
    value: n2k => n2k.fields['Charger Enabled'].toLowerCase(),
    filter: n2k => typeof n2k.fields['Charger Enabled'] === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.equalizationPending',
    value: n2k => n2k.fields['Equalization Pending'].toLowerCase(),
    filter: n2k => typeof n2k.fields['Equalization Pending'] === 'string'
  },
  {
    allowNull: true,
    value: function (n2k) {
      var val = n2k.fields['Equalization Time Remaining']
      var res
      if (typeof val !== 'undefined') {
        res = val * 60 // convert to seconds
      } else {
        res = null
      }
      return res
    },
    node: function (n2k) {
      return prefix(n2k) + '.equalizationTimeRemaining'
    }
  }
]       
