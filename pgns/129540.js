module.exports = [
  {
    node: 'navigation.gnss.satellitesInView',
    value: function (n2k) {
      const satellites = n2k.fields.list.reduce((acc, satInfo) => {
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
