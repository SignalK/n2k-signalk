
module.exports = [
  {
    node: function(n2k) {
      var alarmName = n2k.fields['Alarm ID']

      if ( typeof alarmName === 'string' ) {
        alarmName = alarmName.replace(/ /g, '')
      } else {
        alarmName = `unknown${alarmName}`
      }
      
      var path = n2k.fields['Alarm Group'].toLowerCase().replace(/ /g, '')  + '.' + alarmName;
      return 'notifications.' + path;
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

      var alarmName = n2k.fields['Alarm ID']

      if ( typeof alarmName !== 'string' ) {
        alarmName = `Unknown Seatalk Alarm ${alarmName}`
      }

      return {
        message: alarmName,
        method: method,
        state: state,
        timestamp: n2k.timestamp
      }
    }
  }
]
