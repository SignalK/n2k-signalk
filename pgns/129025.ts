import { PGN_129025 } from '@canboat/ts-pgns'

module.exports = [
  {
    value: function (n2k: PGN_129025) {
      return {
        longitude: Number(n2k.fields.longitude),
        latitude: Number(n2k.fields.latitude)
      }
    },
    filter: function (n2k: PGN_129025) {
      return (
        typeof n2k.fields.longitude !== 'undefined' &&
        typeof n2k.fields.latitude !== 'undefined'
      )
    },
    node: 'navigation.position'
  }
]
