import { PGN_130313 } from '@canboat/ts-pgns'

const humidityMappings = require('../humidityMappings')

module.exports = [
  {
    node: (n2k: PGN_130313) => {
      const mapping = humidityMappings[n2k.fields.source as string]
      if (mapping?.pathWithIndex) {
        return mapping.pathWithIndex.replace('<index>', n2k.fields.instance)
      }
      if (mapping?.path) {
        return mapping.path
      }
      return `environment.userDefined${n2k.fields.source}.${n2k.fields.instance}.relativeHumidity`
    },
    instance: (n2k: PGN_130313) => n2k.fields.instance + '',
    // canboatjs gives the humidity as a ratio.
    source: 'actualHumidity'
  }
]
