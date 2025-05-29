module.exports = [
  {
    source: 'headingToSteerCourse',
    node: function (n2k) {
      const reference =
        n2k.fields.headingReference === 'Magnetic' ? 'Magnetic' : 'True'
      return `steering.autopilot.target.heading${reference}`
    },
    filter: function (n2k) {
      return typeof n2k.fields.headingToSteerCourse !== 'undefined'
    }
  }
]
