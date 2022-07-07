
module.exports =  [
  {
    node: 'steering.autopilot.state',
    value: function(n2k) {
      var mode = Number(n2k.fields['Pilot Mode']);
      var subMode = Number(n2k.fields['Sub Mode']);
      if ( mode == 0 && subMode == 0 )
        return 'standby';
      else if ( mode == 70 && subMode == 0 )  // is sub mode 1 True wind & mode 0 apparent wind?
        return 'wind';
      else if ( (mode == 74 || mode == 129) && subMode == 1 ) // not yet validated
        return 'route';
      else if ( mode == 66 && subMode == 0 )
        return 'auto';
      else  // mode 68 or 64 are valide
        return 'standby';
    }
  }
]
