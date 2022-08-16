const debug = require('debug')('n2k-signalk-126720')

module.exports =  [
  {
    // filters for SmartPilot behind Seatalk-STNG-Converter
    filter: function(n2k) {
      return (
        n2k.description === 'Seatalk1: Pilot Mode' &&
        n2k.fields['Manufacturer Code'] === 'Raymarine' &&
        typeof n2k.fields['Pilot Mode'] !== 'undefined' &&
        typeof n2k.fields['Sub Mode'] !== 'undefined'
      )
    },
    node: 'steering.autopilot.state',
    value: function(n2k) {
      var mode = Number(n2k.fields['Pilot Mode']);
      var subMode = Number(n2k.fields['Sub Mode']);
      if ( (mode == 0 || mode == 64 || mode == 68 || mode == 72) && subMode == 0 ) {
        return 'standby';
      }
      else if ( mode == 70 && ( subMode == 0 || subMode == 4 || subMode == 8 || subMode ==12 ) ) { // submodes: 0=on course,  4=off course pt/stb, 8=wind shift, submode 12 tbd 
        return 'wind';
      }
      else if (mode == 74  && subMode == 0 ) {
        return 'route';
      }
      else if ( mode == 66 && ( subMode == 0 || subMode == 4 ) ) { //subMode 4 means offcourse
        return 'auto';
      }
      else {
        debug('Unknown PGN 126720 AP state found - Mode: ' + mode + ', SubMode: ' + subMode)
        return;
      }
    }
  },
]