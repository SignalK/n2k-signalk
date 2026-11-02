import { PGN_129283 } from '@canboat/ts-pgns'

// Cross Track Error

type State = { lastCourseCalculationType?: string }

module.exports = [
  {
    node: function (n2k: PGN_129283, state: State) {
      return (
        'navigation.course' +
        state.lastCourseCalculationType +
        '.crossTrackError'
      )
    },
    filter: function (n2k: PGN_129283, state?: State) {
      return (
        n2k.fields.navigationTerminated &&
        (n2k.fields.navigationTerminated as unknown) === 'No' &&
        typeof n2k.fields.xte !== 'undefined' &&
        typeof state === 'object' &&
        typeof state.lastCourseCalculationType !== 'undefined'
      )
    },
    source: 'xte'
  }
]
