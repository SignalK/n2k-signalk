const debug = require('debug')('n2k-signalk-130845')
const camelCase = require('camelcase')

module.exports = [
  {
    filter: function (n2k) {
      return (
        n2k.fields['Manufacturer Code'] === 'Simrad' &&
          n2k.fields['Display Group'] !== 'undefined' &&
          n2k.fields['Key'] === 'Backlight level'
      )
    },
    node: (n2k) => { return `electrical.displays.navico.${camelCase(n2k.fields['Display Group'])}.brightness` },
    allowNull: true,
    value: (n2k) => {
      let val = n2k.fields['Value']
      return val !== 'undefined' ? val / 100.0 : null
    }
  },
  {
    filter: function (n2k) {
      return (
        n2k.fields['Manufacturer Code'] === 'Simrad' &&
          n2k.fields['Display Group'] !== 'undefined' &&
          n2k.fields['Key'] === 'Night mode'
      )
    },
    node: (n2k) => { return `electrical.displays.navico.${camelCase(n2k.fields['Display Group'])}.nightMode.state` },
    allowNull: true,
    value: (n2k) => {
      return n2k.fields['Value'] === 4 ? 1 : 0
    }
  },
  {
    filter: function (n2k) {
      return (
        n2k.fields['Manufacturer Code'] === 'Simrad' &&
          n2k.fields['Display Group'] !== 'undefined' &&
          n2k.fields['Key'] === 'Night mode color'
      )
    },
    node: (n2k) => { return `electrical.displays.navico.${camelCase(n2k.fields['Display Group'])}.nightModeColor` },
    allowNull: true,
    value: (n2k) => {
      let val = nightModeColorMapping[n2k.fields['Value']]
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
