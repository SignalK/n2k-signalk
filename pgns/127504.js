const { acPhase } = require('../utils.js')

function instance (n2k) {
  return n2k.fields['Instance']
}

function prefix (n2k) {
  return `electrical.inverters.${instance(n2k)}.${acPhase(n2k)}`
}

module.exports = [
  {
    source: 'Waveform',
    node: function (n2k) {
      return `${prefix(n2k)}.waveform`
    }
  },
  {
    source: 'Voltage',
    node: function (n2k) {
      return `${prefix(n2k)}.voltage`
    }
  },
  {
    source: 'Current',
    node: function (n2k) {
      return `${prefix(n2k)}.current`
    }
  },
  {
    source: 'Frequency',
    node: function (n2k) {
      return `${prefix(n2k)}.frequency`
    }
  },
  {
    source: 'Frequency',
    node: function (n2k) {
      return `${prefix(n2k)}.frequency`
    }
  },
  {
    source: 'Breaker Size',
    node: function (n2k) {
      return `${prefix(n2k)}.breakerSize`
    }
  },
  {
    source: 'Real Power',
    node: function (n2k) {
      return `${prefix(n2k)}.realPower`
    }
  },
  {
    source: 'Reactive Power',
    node: function (n2k) {
      return `${prefix(n2k)}.reactivePower`
    }
  },
  {
    source: 'Power Factor',
    node: function (n2k) {
      return `${prefix(n2k)}.powerFactor`
    }
  }
]
