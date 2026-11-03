import { PGN_129285 } from '@canboat/ts-pgns'

const _ = require('lodash')

type State = { lastCourseCalculationType?: string }

module.exports = [
  {
    node: function (n2k: PGN_129285, state: State) {
      return (
        'navigation.course' +
        state.lastCourseCalculationType +
        '.activeRoute.name'
      )
    },
    filter: function (n2k: PGN_129285, state?: State) {
      return hasState(state)
    },
    source: 'routeName'
  },
  {
    node: function (n2k: PGN_129285, state: State) {
      return (
        'navigation.course' +
        state.lastCourseCalculationType +
        '.previousPoint.name'
      )
    },
    filter: function (n2k: PGN_129285, state?: State) {
      return hasState(state) && hasWaypoints(n2k, 1)
    },
    value: function (n2k: PGN_129285) {
      return n2k.fields.list[0].wpName
    }
  },
  {
    node: function (n2k: PGN_129285, state: State) {
      return (
        'navigation.course' +
        state.lastCourseCalculationType +
        '.previousPoint.position'
      )
    },
    filter: function (n2k: PGN_129285, state?: State) {
      return hasState(state) && hasWaypoints(n2k, 1)
    },
    value: function (n2k: PGN_129285) {
      return {
        latitude: n2k.fields.list[0].wpLatitude,
        longitude: n2k.fields.list[0].wpLongitude
      }
    }
  },
  {
    node: function (n2k: PGN_129285, state: State) {
      return (
        'navigation.course' +
        state.lastCourseCalculationType +
        '.nextPoint.name'
      )
    },
    filter: function (n2k: PGN_129285, state?: State) {
      return hasState(state) && hasWaypoints(n2k, 2)
    },
    value: function (n2k: PGN_129285) {
      return n2k.fields.list[1].wpName
    }
  },
  {
    node: function (n2k: PGN_129285, state: State) {
      return (
        'navigation.course' +
        state.lastCourseCalculationType +
        '.followingPoint.name'
      )
    },
    filter: function (n2k: PGN_129285, state?: State) {
      return (
        hasState(state) &&
        hasWaypoints(n2k, 3) &&
        !_.isUndefined(n2k.fields.list[2].wpLatitude) &&
        !_.isUndefined(n2k.fields.list[2].wpLongitude)
      )
    },
    value: function (n2k: PGN_129285) {
      return n2k.fields.list[2].wpName
    }
  },
  {
    node: function (n2k: PGN_129285, state: State) {
      return (
        'navigation.course' +
        state.lastCourseCalculationType +
        '.followingPoint.position'
      )
    },
    filter: function (n2k: PGN_129285, state?: State) {
      return (
        hasState(state) &&
        hasWaypoints(n2k, 3) &&
        !_.isUndefined(n2k.fields.list[2].wpLatitude) &&
        !_.isUndefined(n2k.fields.list[2].wpLongitude)
      )
    },
    value: function (n2k: PGN_129285) {
      return {
        latitude: n2k.fields.list[2].wpLatitude,
        longitude: n2k.fields.list[2].wpLongitude
      }
    }
  }
]

function hasState(state?: State) {
  return (
    typeof state === 'object' &&
    typeof state.lastCourseCalculationType !== 'undefined'
  )
}

function hasWaypoints(n2k: PGN_129285, min: number) {
  return !_.isUndefined(n2k.fields.list) && n2k.fields.list.length >= min
}
