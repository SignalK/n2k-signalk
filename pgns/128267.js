module.exports = [
  {
    source: 'depth',
    node: 'environment.depth.belowTransducer'
  },
  {
    source: 'offset',
    node: 'environment.depth.surfaceToTransducer',
    filter: function (n2k) {
      return typeof n2k.fields.offset !== 'undefined' && n2k.fields.offset > 0
    }
  },
  {
    source: 'offset',
    node: 'environment.depth.transducerToKeel',
    filter: function (n2k) {
      return typeof n2k.fields.offset !== 'undefined' && n2k.fields.offset < 0
    }
  },
  {
    node: 'environment.depth.belowSurface',
    filter: function (n2k) {
      return (
        typeof n2k.fields.depth !== 'undefined' &&
        typeof n2k.fields.offset !== 'undefined' &&
        n2k.fields.offset > 0
      )
    },
    value: function (n2k) {
      return Number(n2k.fields.depth) + Number(n2k.fields.offset)
    }
  },
  {
    node: 'environment.depth.belowKeel',
    filter: function (n2k) {
      return (
        typeof n2k.fields.depth !== 'undefined' &&
        typeof n2k.fields.offset !== 'undefined' &&
        n2k.fields.offset < 0
      )
    },
    value: function (n2k) {
      return Number(n2k.fields.depth) + Number(n2k.fields.offset)
    }
  }
]
