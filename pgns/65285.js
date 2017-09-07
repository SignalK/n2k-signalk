module.exports = [
  {
    source: 'Actual Temperature',
    node: 'environment.engine_room.temperature',
    filter: function (n2k) {
      return n2k.fields['Actual Temperature']
    }
  }
]
