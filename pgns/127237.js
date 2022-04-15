module.exports = [
  {
    source: 'Heading-To-Steer (Course)',
    node: function (n2k) {
      const reference = n2k.fields['Heading Reference'] === 'Magnetic' ? 'Magnetic' : 'True'
      return `steering.autopilot.target.heading${reference}`
    },
    filter: function (n2k) {
      return typeof n2k.fields['Heading-To-Steer (Course)'] !== 'undefined'
    },
  },
]
