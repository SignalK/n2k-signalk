module.exports = [
  {
    source: 'Depth',
    node: 'environment.depth.belowTransducer'
  },
  {
    source: 'Offset',
    node: 'environment.depth.surfaceToTransducer',
    filter: function (n2k) {
      return (
        typeof n2k.fields['Offset'] !== 'undefined' && n2k.fields['Offset'] > 0
      )
    }
  },
  {
    source: 'Offset',
    node: 'environment.depth.transducerToKeel',
    filter: function (n2k) {
      return (
        typeof n2k.fields['Offset'] !== 'undefined' && n2k.fields['Offset'] < 0
      )
    }
  },
  {
    node: 'environment.depth.belowSurface',
    filter: function (n2k) {
      return (
        typeof n2k.fields['Depth'] !== 'undefined' &&
        typeof n2k.fields['Offset'] !== 'undefined' &&
        n2k.fields['Offset'] > 0
      )
    },
    value: function (n2k) {
      return Number(n2k.fields.Depth) + Number(n2k.fields.Offset)
    }
  },
  {
    node: 'environment.depth.belowKeel',
    filter: function (n2k) {
      return (
        typeof n2k.fields['Depth'] !== 'undefined' &&
        typeof n2k.fields['Offset'] !== 'undefined' &&
        n2k.fields['Offset'] < 0
      )
    },
    value: function (n2k) {
      return Number(n2k.fields.Depth) + Number(n2k.fields.Offset)
    }
  }
]
