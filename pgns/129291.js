module.exports = [
  {
    node: 'environment.current',
    value: function (n2k) {
      if (n2k.fields.setReference === 'True') {
        return {
          setTrue: Number(n2k.fields.set),
          drift: Number(n2k.fields.drift)
        }
      } else if (n2k.fields.setReference === 'Magnetic') {
        return {
          setMagnetic: Number(n2k.fields.set),
          drift: Number(n2k.fields.drift)
        }
      }
    }
  }
]
