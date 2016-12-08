
module.exports = [
  {
    node: function(n2k) {
      var alarmName = n2k.fields['Alarm Group'].toLowerCase().replace(/ /g, '') + '.' + n2k.fields['Alarm ID'].replace(/ /g, '');
      return 'notifications.' + alarmName;
    },
    value: function(n2k) {
      var state = n2k.fields['Alarm Status'];

      var method = [ 'visual' ];

      if ( state == 'Alarm condition met and not silenced' ) {
        method.push('sound');
      }

      if ( state == 'Alarm condition not met' ) {
        state = 'normal'
      } else {
        state = 'alarm'
      }


      return {
        message: n2k.fields['Alarm ID'],
        method: method,
        state: state,
        timestamp: n2k.timestamp
      }
    }
  }
]
