module.exports = [
  {
    source: 'Battery Status',
    node: function(n2k){
      return `electrical.batteries.wireless${n2k.src}.batteryStatus`
    }
  },{
    source: 'Battery Charge Status',
    node: function(n2k){
      return `electrical.batteries.wireless${n2k.src}.batteryChargeStatus`
    }
  },
]
