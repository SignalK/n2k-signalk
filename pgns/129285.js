const debug = require('debug')('n2k-signalk-129285')
const _ = require('lodash')

module.exports = [
  {
    node: 'navigation.currentRoute.name',
    source: 'routeName'
  },
  {
    node: 'navigation.currentRoute.waypoints',
    filter: n2k => {
      return !_.isUndefined(n2k.fields.list)
    },
    value: n2k => {
      var idx = 0
      return n2k.fields.list.map(wp => {
        return {
          name: wp.wpName,
          position: {
            value: {
              latitude: wp.wpLatitude,
              longitude: wp.wpLongitude
            }
          }
        }
      })
    }
  }
]
