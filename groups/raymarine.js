
exports.mappings = {
  // Seatalk: Pilot Wind Datum
  '65345': [{
    node: 'steering.autopilot.target.windAngleApparent',
    value: function(n2k) {
      var angle = Number(n2k.fields['Wind Datum'])
      if ( angle > Math.PI )
        angle = angle-(Math.PI*2);
      return angle;
    }   
  }],

  //Seatalk: Pilot Mode
  '65379': [{
    node: 'steering.autopilot.state',
    value: function(n2k) {
      var mode = Number(n2k.fields['Pilot Mode']);
      var subMode = Number(n2k.fields['Sub Mode']);
      if ( mode == 0 && subMode == 0 )
        return 'standby';
      else if ( mode == 0 && subMode == 1 )
        return 'wind';
      else if ( (mode == 128 || mode == 129) && subMode == 1 )
        return 'route';
      else if ( mode == 64 && subMode == 0 )
        return 'auto';
      else
        return 'standby';
    }
  }],

  //Seatalk: Pilot Locked Heading
  '65360': [{
    node: 'steering.autopilot.target.headingTrue',
    filter: function(n2k) {
      return n2k.fields['Target Heading True']
    },
    source: 'Target Heading True'
  },{
    node: 'steering.autopilot.target.headingMagnetic',
    filter: function(n2k) {
      return n2k.fields['Target Heading Magnetic']
    },
    source: 'Target Heading Magnetic'
  }],

  // Seatalk: Alarm
  '65288': [{
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
  }]
}
