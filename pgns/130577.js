module.exports = [
  {
    source: 'cog',
    node: 'navigation.courseOverGroundTrue',
    filter: function (n2k) {
      return n2k.fields.cogReference === 'True'
    }
  },
  {
    source: 'sog',
    node: 'navigation.speedOverGround',
    filter: function (n2k) {
      return n2k.fields.sog
    }
  },
  {
    node: 'environment.current',
    filter: function (n2k) {
      return n2k.fields.drift && n2k.fields.set
    },
    value: function (n2k) {
      if (n2k.fields.cogReference === 'True') {
        return {
          setTrue: Number(n2k.fields.set),
          drift: Number(n2k.fields.drift)
        }
      } else if (n2k.fields.setReference === 'Magnetic') {
        // speculative, I don't have a real world sample showing 'Magnetic'
        return {
          setTrue: Number(n2k.fields.set),
          drift: Number(n2k.fields.drift)
        }
      }
    }
  }
]
