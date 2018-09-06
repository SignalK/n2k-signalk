// Cross Track Error

module.exports = [
  {
    node: function (n2k, state) {
      return (
        'navigation.course' +
        state.lastCourseCalculationType +
        '.crossTrackError'
      )
    },
    filter: function (n2k, state) {
      return (
        n2k.fields['Navigation Terminated'] &&
        n2k.fields['Navigation Terminated'] === 'No' &&
        typeof n2k.fields['XTE'] !== 'undefined' &&
        typeof state === 'object' &&
        typeof state.lastCourseCalculationType !== 'undefined'
      )
    },
    source: 'XTE'
  }
]
