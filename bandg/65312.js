module.exports = [
  {
    source: 'Signal Strength',
    node: function(n2k){
      return `instruments.wireless.${n2k.src}.signalStrength`
    }
  }
]
