const debug = require('debug')('n2k-signalk-130845')
const camelCase = require('camelcase')

// canboat 7 renamed this field from displayGroup to networkGroup (same byte,
// same 'Group N' values); accept either so both canboatjs generations map.
const group = (n2k) => n2k.fields.networkGroup ?? n2k.fields.displayGroup

module.exports = [
  {
    filter: function (n2k) {
      return (
        n2k.fields.manufacturerCode === 'Simrad' &&
        typeof group(n2k) === 'string' &&
        n2k.fields.key === 'Backlight level'
      )
    },
    node: (n2k) => {
      return `electrical.displays.navico.${camelCase(group(n2k))}.brightness`
    },
    allowNull: true,
    value: (n2k) => {
      let val = n2k.fields.value
      return val !== 'undefined' ? val / 100.0 : null
    }
  },
  {
    filter: function (n2k) {
      return (
        n2k.fields.manufacturerCode === 'Simrad' &&
        typeof group(n2k) === 'string' &&
        n2k.fields.key === 'Night mode'
      )
    },
    node: (n2k) => {
      return `electrical.displays.navico.${camelCase(group(n2k))}.nightMode.state`
    },
    allowNull: true,
    value: (n2k) => {
      return n2k.fields.value === 4 ? 1 : 0
    }
  },
  {
    filter: function (n2k) {
      return (
        n2k.fields.manufacturerCode === 'Simrad' &&
        typeof group(n2k) === 'string' &&
        n2k.fields.key === 'Night mode color'
      )
    },
    node: (n2k) => {
      return `electrical.displays.navico.${camelCase(group(n2k))}.nightModeColor`
    },
    allowNull: true,
    value: (n2k) => {
      let val = nightModeColorMapping[n2k.fields.value]
      return val ? val : 'unknown'
    }
  }
]

const nightModeColorMapping = {
  0: 'red',
  1: 'green',
  2: 'blue',
  3: 'white',
  4: 'magenta'
}
