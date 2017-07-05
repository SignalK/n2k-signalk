
module.exports = [
  {
    source: 'State of Charge',
    node: function(n2k) {
      return 'electrical.batteries.' + n2k.fields['DC Instance'] + '.capacity.stateOfCharge'
    }
  },{
    source: 'State of Health',
    node: function(n2k) {
      return 'electrical.batteries.' + n2k.fields['DC Instance'] + '.capacity.stateOfHealth'
    }
  },{
    source: 'Time Remaining',
    node: function(n2k) {
      return 'electrical.batteries.' + n2k.fields['DC Instance'] + '.capacity.timeRemaining'
    }
  }/*,{
    source: 'Ripple Voltage',
    node: function(n2k) {
      return 'electrical.batteries.' + n2k.fields['DC Instance'] + '.voltage.ripple'
    }
  }*/
]
