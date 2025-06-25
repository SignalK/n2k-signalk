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
        n2k.fields.navigationTerminated &&
        n2k.fields.navigationTerminated === 'No' &&
        typeof n2k.fields.xte !== 'undefined' &&
        typeof state === 'object' &&
        typeof state.lastCourseCalculationType !== 'undefined'
      )
    },
    source: 'xte'
  }
]
