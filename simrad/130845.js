const debug = require('debug')('n2k-signalk-130845')
const camelCase = require('camelcase')

module.exports = [
  {
    filter: function (n2k) {
      return (
        n2k.fields.manufacturerCode === 'Simrad' &&
          n2k.fields.displayGroup !== 'undefined' &&
          n2k.fields.key === 'Backlight level'
      )
    },
    node: (n2k) => { return `electrical.displays.navico.${camelCase(n2k.fields.displayGroup)}.brightness` },
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
          n2k.fields.displayGroup !== 'undefined' &&
          n2k.fields.key === 'Night mode'
      )
    },
    node: (n2k) => { return `electrical.displays.navico.${camelCase(n2k.fields.displayGroup)}.nightMode.state` },
    allowNull: true,
    value: (n2k) => {
      return n2k.fields.value === 4 ? 1 : 0
    }
  },
  {
    filter: function (n2k) {
      return (
        n2k.fields.manufacturerCode === 'Simrad' &&
          n2k.fields.displayGroup !== 'undefined' &&
          n2k.fields.key === 'Night mode color'
      )
    },
    node: (n2k) => { return `electrical.displays.navico.${camelCase(n2k.fields.displayGroup)}.nightModeColor` },
    allowNull: true,
    value: (n2k) => {
      let val = nightModeColorMapping[n2k.fields.value]
      return val ? val : 'unknown'
    }
  },
]

const nightModeColorMapping = {
  0: 'red',
  1: 'green',
  2: 'blue',
  3: 'white',
  4: 'magenta'
}
