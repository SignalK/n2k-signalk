
exports.mappings = {
  //Rudder
  '127245': [{
    source: 'Position',
    node: 'steering.rudderAngle',
    filter: function(n2k) {
      return typeof n2k.fields['Position'] != 'undefined'
    }
  }]
}
