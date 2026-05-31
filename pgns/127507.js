const { timeToSeconds } = require('../utils.js')

function prefix (n2k) {
  return 'electrical.chargers.' + n2k.fields.instance
}

module.exports = [
  {
    node: n2k => prefix(n2k) + '.operatingState',
    value: n2k => n2k.fields.operatingState.toLowerCase(),
    filter: n2k => typeof n2k.fields.operatingState === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.chargeMode',
    value: n2k => n2k.fields.chargeMode.toLowerCase(),
    filter: n2k => typeof n2k.fields.chargeMode === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.enabled',
    value: n2k => n2k.fields.enabled === 'On',
    filter: n2k => typeof n2k.fields.enabled === 'string'
  },
  {
    node: n2k => prefix(n2k) + '.equalizationPending',
    value: n2k => n2k.fields.equalizationPending === 'On',
    filter: n2k => typeof n2k.fields.equalizationPending === 'string'
  },
  {
    allowNull: true,
    node: n2k => prefix(n2k) + '.equalizationTimeRemaining',
    value: n2k => timeToSeconds(n2k.fields.equalizationTimeRemaining)
  }
]
