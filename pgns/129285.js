const debug = require('debug')('n2k-signalk-129285')
const _ = require('lodash')

module.exports = [
  {
    node: function (n2k, state) {
      return (
        'navigation.course' +
        state.lastCourseCalculationType +
        '.activeRoute.name'
      )
    },
    filter: function (n2k, state) {
      return hasState(state)
    },
    source: 'routeName'
  },
  {
    node: function (n2k, state) {
      return (
        'navigation.course' +
        state.lastCourseCalculationType +
        '.previousPoint.name'
      )
    },
    filter: function (n2k, state) {
      return hasState(state) && hasWaypoints(n2k, 1)
    },
    value: function (n2k) {
      return n2k.fields.list[0].wpName
    }
  },
  {
    node: function (n2k, state) {
      return (
        'navigation.course' +
        state.lastCourseCalculationType +
        '.previousPoint.position'
      )
    },
    filter: function (n2k, state) {
      return hasState(state) && hasWaypoints(n2k, 1)
    },
    value: function (n2k) {
      return {
        latitude: n2k.fields.list[0].wpLatitude,
        longitude: n2k.fields.list[0].wpLongitude
      }
    }
  },
  {
    node: function (n2k, state) {
      return (
        'navigation.course' +
        state.lastCourseCalculationType +
        '.nextPoint.name'
      )
    },
    filter: function (n2k, state) {
      return hasState(state) && hasWaypoints(n2k, 2)
    },
    value: function (n2k) {
      return n2k.fields.list[1].wpName
    }
  },
  {
    node: function (n2k, state) {
      return (
        'navigation.course' +
        state.lastCourseCalculationType +
        '.followingPoint.name'
      )
    },
    filter: function (n2k, state) {
      return (
        hasState(state) &&
        hasWaypoints(n2k, 3) &&
        !_.isUndefined(n2k.fields.list[2].wpLatitude) &&
        !_.isUndefined(n2k.fields.list[2].wpLongitude)
      )
    },
    value: function (n2k) {
      return n2k.fields.list[2].wpName
    }
  },
  {
    node: function (n2k, state) {
      return (
        'navigation.course' +
        state.lastCourseCalculationType +
        '.followingPoint.position'
      )
    },
    filter: function (n2k, state) {
      return (
        hasState(state) &&
        hasWaypoints(n2k, 3) &&
        !_.isUndefined(n2k.fields.list[2].wpLatitude) &&
        !_.isUndefined(n2k.fields.list[2].wpLongitude)
      )
    },
    value: function (n2k) {
      return {
        latitude: n2k.fields.list[2].wpLatitude,
        longitude: n2k.fields.list[2].wpLongitude
      }
    }
  }
]

function hasState (state) {
  return (
    typeof state === 'object' &&
    typeof state.lastCourseCalculationType !== 'undefined'
  )
}

function hasWaypoints (n2k, min) {
  return !_.isUndefined(n2k.fields.list) && n2k.fields.list.length >= min
}
