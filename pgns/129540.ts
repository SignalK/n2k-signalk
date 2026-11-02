import { PGN_129540 } from '@canboat/ts-pgns'

type Satellite = {
  id: unknown
  elevation: unknown
  azimuth: unknown
  SNR: unknown
}

module.exports = [
  {
    node: 'navigation.gnss.satellitesInView',
    value: function (n2k: PGN_129540) {
      const satellites = n2k.fields.list.reduce((acc: Satellite[], satInfo) => {
        if (Object.keys(satInfo).length >= 4) {
          const {
            prn: id,
            elevation: elevation,
            azimuth: azimuth,
            snr: SNR
          } = satInfo
          acc.push({
            id,
            elevation,
            azimuth,
            SNR
          })
        }
        return acc
      }, [])
      return {
        count: satellites.length,
        satellites
      }
    }
  }
]
