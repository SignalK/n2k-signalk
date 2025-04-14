const debug = require('debug')('n2k-signalk-129285')
const _ = require('lodash')

module.exports = [
  {
    node: 'navigation.currentRoute.name',
    source: 'Route Name'
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
          name: wp['WP Name'].replace(/\0.*$/g, ''),
          position: {
            value: {
              latitude: wp['WP Latitude'],
              longitude: wp['WP Longitude']
            }
          }
        }
      })
    }
  }
]
